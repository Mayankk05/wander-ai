import { checkTripAccess } from '../lib/checkTripAccess.js';
import { geminiClient } from '../pipeline/geminiClient.js';
import { itinerarySchema, validateItinerary } from '../pipeline/validator.js';
import prisma from '../lib/prisma.js';
import { getOptimizationPrompt } from '../lib/prompts.js';

export const getBudgetSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId);
    
    if (!access.authorized) {
      return res.status(access.status).json({ error: access.error });
    }

    const trip = access.trip;
    const itinerary = trip.itinerary || {};
    
    const totalCost = itinerary.totalCost || 0;
    const budget = trip.budget;
    const difference = totalCost - budget;
    const percentageOver = budget > 0 ? ((totalCost - budget) / budget * 100).toFixed(1) : 0;
    const perDayBudget = Math.floor(budget / trip.days);

    const dayBreakdown = (itinerary.days || []).map(day => {
      const dayCost = day.dayCost || 0;
      return {
        day: day.day,
        title: day.title,
        dayCost,
        perDayBudget,
        overForDay: dayCost > perDayBudget
      };
    });

    res.status(200).json({
      totalCost,
      budget,
      currency: itinerary.currency || 'INR',
      overBudget: trip.overBudget,
      difference,
      percentageOver: Number(percentageOver),
      perDayBudget,
      dayBreakdown
    });
  } catch (error) {
    console.error("ERROR in getBudgetSummary:", error.message);
    next(error);
  }
};

export const optimizeBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await checkTripAccess(id, req.userId, true);

    if (!access.authorized) {
      return res.status(access.status).json({ error: access.error });
    }

    const trip = access.trip;
    if (!trip.overBudget) {
      return res.status(400).json({ error: "Trip is already within budget" });
    }

    const controller = new AbortController();
    req.on('close', () => {
      console.log("[Budget Controller] SSE connection closed by client.");
      controller.abort();
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip) throw new Error("Trip not found");
      if (!trip.overBudget) throw new Error("Already within budget");

      const itinerary = trip.itinerary;
      const totalCost = itinerary.totalCost || 0;
      const percentageOver = trip.budget > 0 
        ? ((totalCost - trip.budget) / trip.budget * 100).toFixed(1)
        : "100";

      const prompt = getOptimizationPrompt(trip, itinerary, percentageOver);
      const modelOptions = { generationConfig: { responseMimeType: "application/json" } };

      const result = await geminiClient.generateContentStream(modelOptions, prompt, null, controller.signal);
      
      let fullResponse = "";
      for await (const chunk of result.stream) {
        if (controller.signal.aborted) break;
        const chunkText = chunk.text();
        fullResponse += chunkText;
        res.write("data: " + JSON.stringify({ type: "chunk", text: chunkText }) + "\n\n");
      }

      const validatedItinerary = await validateItinerary(fullResponse, { destination: trip.destination, budget: trip.budget }, res, id);

      const currentHistory = Array.isArray(trip.history) ? trip.history : [];
      const newHistory = [...currentHistory, { 
        itinerary: trip.itinerary, 
        overBudget: trip.overBudget,
        timestamp: new Date().toISOString() 
      }].slice(-5);

      return tx.trip.update({
        where: { id },
        data: { 
          itinerary: validatedItinerary, 
          overBudget: validatedItinerary.totalCost > trip.budget,
          history: newHistory
        }
      });
    });

    res.write("data: " + JSON.stringify({ type: "complete", trip: updatedTrip }) + "\n\n");
    res.end();
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Optimization failed");
    if (!res.headersSent) {
      return res.status(error.message === "Trip not found" ? 404 : 500).json({ error: error.message });
    }
    res.write("data: " + JSON.stringify({ type: "error", message: error.message }) + "\n\n");
    res.end();
  }
};
