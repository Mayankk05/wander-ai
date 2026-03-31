import { fetchDestinationImage } from '../lib/unsplash.js';
import { checkTripAccess } from '../lib/checkTripAccess.js';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

import { 
  createTripSchema, 
  updateTripSchema 
} from '../lib/schemas.js';
import { recalculateItinerary } from '../lib/math.js';

export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { collaborators: true }
    });
    res.status(200).json({ trips });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch all trips");
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const data = req.validatedData?.body || req.body;
    const { title, destination, days, budget, itinerary } = data;
    const finalItinerary = recalculateItinerary(itinerary !== undefined ? itinerary : {});
    const overBudget = finalItinerary.totalCost > budget;
    const imageUrl = await fetchDestinationImage(destination);

    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        days,
        budget,
        itinerary: finalItinerary,
        imageUrl,
        overBudget,
        userId: req.userId
      }
    });

    res.status(201).json({ trip });
  } catch (error) {
    req.log.error({ err: error }, "Failed to create trip");
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, false, req.userEmail);

    if (!access.authorized) {
      const err = new Error(access.error);
      err.statusCode = access.status;
      return next(err);
    }

    res.status(200).json({ trip: access.trip });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch trip by ID");
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, true, req.userEmail);

    if (!access.authorized) {
      const err = new Error(access.error);
      err.statusCode = access.status;
      return next(err);
    }

    const { trip, isOwner } = access;

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const validatedData = req.validatedData?.body || req.body;
      const updateData = {};

      if (!isOwner) {
        if (validatedData.itinerary !== undefined) updateData.itinerary = validatedData.itinerary;
        if (validatedData.title || validatedData.destination || validatedData.budget || validatedData.days) {
          throw new Error("Only owners can modify trip basic settings");
        }
      } else {
        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.destination !== undefined) updateData.destination = validatedData.destination;
        if (validatedData.days !== undefined) updateData.days = validatedData.days;
        if (validatedData.budget !== undefined) updateData.budget = validatedData.budget;
        if (validatedData.itinerary !== undefined) updateData.itinerary = validatedData.itinerary;
      }

      if (updateData.budget !== undefined || updateData.itinerary !== undefined) {
        const currentBudget = updateData.budget ?? trip.budget;
        const currentItinerary = recalculateItinerary(updateData.itinerary ?? trip.itinerary);
        updateData.itinerary = currentItinerary;
        updateData.overBudget = currentItinerary.totalCost > currentBudget;
      }

      const currentHistory = Array.isArray(trip.history) ? trip.history : [];
      updateData.history = [...currentHistory, { 
        itinerary: trip.itinerary, 
        overBudget: trip.overBudget,
        title: trip.title,
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget,
        timestamp: new Date().toISOString() 
      }].slice(-5);

      return tx.trip.update({
        where: { id },
        data: updateData
      });
    });

    res.status(200).json({ trip: updatedTrip });
  } catch (error) {
    if (error.message === "Only owners can modify trip basic settings") {
       error.statusCode = 403;
    }
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, false, req.userEmail);

    if (!access.authorized) {
      const err = new Error(access.error);
      err.statusCode = access.status;
      return next(err);
    }

    if (!access.isOwner) {
      const err = new Error("Only the owner can delete this trip");
      err.statusCode = 403;
      return next(err);
    }

    await prisma.trip.delete({
      where: { id }
    });

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    req.log.error({ err: error }, "Failed to delete trip");
    next(error);
  }
};

export const refreshTripImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, true, req.userEmail);

    if (!access.authorized) {
      const err = new Error(access.error);
      err.statusCode = access.status;
      return next(err);
    }

    const trip = access.trip;
    const imageUrl = await fetchDestinationImage(trip.destination, true);

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { imageUrl }
    });

    res.status(200).json({ trip: updatedTrip });
  } catch (error) {
    req.log.error({ err: error }, "Failed to refresh trip image");
    next(error);
  }
};
export const undoLastChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, true, req.userEmail);

    if (!access.authorized) {
      const err = new Error(access.error);
      err.statusCode = access.status;
      return next(err);
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip) throw new Error("Trip not found");
      
      const history = Array.isArray(trip.history) ? trip.history : [];
      if (history.length === 0) throw new Error("No history available to undo");

      const lastVersion = history[history.length - 1];
      const updatedHistory = history.slice(0, -1);

      const isValid = lastVersion && typeof lastVersion === 'object' && 
                     (lastVersion.itinerary || lastVersion.title || lastVersion.budget);
      
      if (!isValid) {
        throw new Error("Cannot undo: Previous version is corrupted or incompatible");
      }

      const updateData = {
        itinerary: lastVersion.itinerary,
        overBudget: lastVersion.overBudget,
        history: updatedHistory
      };
      
      if (lastVersion.title !== undefined) updateData.title = lastVersion.title;
      if (lastVersion.destination !== undefined) updateData.destination = lastVersion.destination;
      if (lastVersion.days !== undefined) updateData.days = lastVersion.days;
      if (lastVersion.budget !== undefined) updateData.budget = lastVersion.budget;

      return tx.trip.update({
        where: { id },
        data: updateData
      });
    });

    res.status(200).json({ message: "Last change undone", trip: updatedTrip });
  } catch (error) {
    if (error.message === "Trip not found") error.statusCode = 404;
    if (error.message === "No history available to undo") error.statusCode = 400;
    
    next(error);
  }
};

