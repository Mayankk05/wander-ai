import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

export const enableShare = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      req.log.warn({ tripId: id, userId: req.userId }, "Trip not found for share enable");
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.userId !== req.userId) {
      req.log.warn({ tripId: id, userId: req.userId }, "Unauthorized share enable attempt");
      return res.status(403).json({ error: "Not authorized" });
    }

    const shareLink = trip.shareLink || crypto.randomUUID();

    const updated = await prisma.trip.update({
      where: { id },
      data: { isPublic: true, shareLink }
    });

    return res.status(200).json({
      message: "Share link enabled",
      shareLink: `${frontendUrl}/share/${updated.shareLink}`,
      token: updated.shareLink
    });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to enable share");
    next(error);
  }
};

export const disableShare = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      req.log.warn({ tripId: id, userId: req.userId }, "Trip not found for share disable");
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.userId !== req.userId) {
      req.log.warn({ tripId: id, userId: req.userId }, "Unauthorized share disable attempt");
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.trip.update({
      where: { id },
      data: { isPublic: false }
    });

    res.status(200).json({ message: "Share link disabled" });
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Failed to disable share");
    next(error);
  }
};

export const getSharedTrip = async (req, res, next) => {
  try {
    const { token } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { shareLink: token },
      include: { user: { select: { emailVerified: true } } }
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!trip.isPublic) {
      return res.status(403).json({ error: "This trip is no longer shared" });
    }

    const publicTrip = {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      days: trip.days,
      budget: trip.budget,
      itinerary: trip.itinerary,
      imageUrl: trip.imageUrl,
      createdAt: trip.createdAt,
      isPublic: trip.isPublic,
      overBudget: trip.overBudget,
      owner_verified: trip.user?.emailVerified || false
    };

    res.status(200).json({ trip: publicTrip });
  } catch (error) {
    req.log.error({ err: error, token: req.params.token }, "Failed to get shared trip");
    next(error);
  }
};
