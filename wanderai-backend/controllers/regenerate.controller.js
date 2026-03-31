import { z } from 'zod';
import { checkTripAccess } from '../lib/checkTripAccess.js';
import { geminiClient } from '../pipeline/geminiClient.js';
import { daySchema } from '../pipeline/validator.js';
import { geocodePlaces } from '../pipeline/geocoder.js';
import prisma from '../lib/prisma.js';
import { getRegenerationPrompt, getFullRegenerationPrompt } from '../lib/prompts.js';
import { recalculateItinerary } from '../lib/math.js';

const regenSchema = z.object({
  dayIndex: z.number().min(0),
  reason: z.string().optional().default("Please suggest better alternatives")
});

export const regenerateDay = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const validation = regenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed" });
    }
    const { dayIndex, reason } = validation.data;

    const access = await checkTripAccess(id, req.userId, true);
    if (!access.authorized) {
      return res.status(access.status).json({ error: access.error });
    }

    const trip = access.trip;
    const itinerary = trip.itinerary || { days: [] };
    const originalDay = (itinerary.days || [])[dayIndex];
    
    if (!originalDay) {
      return res.status(400).json({ error: "Invalid day index" });
    }

    const controller = new AbortController();
    req.on('close', () => {
      console.log("[Regen Controller] SSE connection closed by client.");
      controller.abort();
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const prompt = getRegenerationPrompt(trip, originalDay, reason);
    const result = await geminiClient.generateContentStream(
      { generationConfig: { responseMimeType: "application/json" } }, 
      prompt, 
      null, 
      controller.signal
    );
    
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write("data: " + JSON.stringify({ type: "chunk", text: chunkText }) + "\n\n");
    }

    let cleanString = fullResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleanString.startsWith('{')) {
      const match = cleanString.match(/\{[\s\S]*\}/);
      if (match) cleanString = match[0];
    }
    const parsed = JSON.parse(cleanString);
    const schemaCheck = daySchema.safeParse(parsed);
    if (!schemaCheck.success) throw new Error("Regeneration failed validation");

    let newDay = schemaCheck.data;
    const mockItinerary = { days: [newDay] };
    await geocodePlaces(mockItinerary, trip.destination);
    newDay = mockItinerary.days[0];
    newDay.weather = originalDay.weather;

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const dbTrip = await tx.trip.findUnique({ where: { id } });
      if (!dbTrip) throw new Error("Trip not found");
      
      const it = dbTrip.itinerary || { days: [] };
      const currentHistory = Array.isArray(dbTrip.history) ? dbTrip.history : [];
      const newHistory = [...currentHistory, { 
        itinerary: dbTrip.itinerary, 
        overBudget: dbTrip.overBudget,
        timestamp: new Date().toISOString() 
      }].slice(-5);

      const updatedDays = [...(it.days || [])];
      updatedDays[dayIndex] = newDay;
      
      const newItinerary = recalculateItinerary({ ...it, days: updatedDays });

      return tx.trip.update({
        where: { id },
        data: { 
          itinerary: newItinerary, 
          overBudget: newItinerary.totalCost > dbTrip.budget,
          history: newHistory
        }
      });
    });

    res.write("data: " + JSON.stringify({ type: "complete", trip: updatedTrip }) + "\n\n");
    res.end();
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Regeneration failed");
    if (!res.headersSent) {
      return res.status(error.message === "Trip not found" ? 404 : 500).json({ error: error.message });
    }
    res.write("data: " + JSON.stringify({ type: "error", message: error.message }) + "\n\n");
    res.end();
  }
};

export const regenerateFull = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const access = await checkTripAccess(id, req.userId, true);
    if (!access.authorized) {
      return res.status(access.status).json({ error: access.error });
    }

    const trip = access.trip;

    const controller = new AbortController();
    req.on('close', () => {
      console.log("[Full Regen Controller] SSE connection closed by client.");
      controller.abort();
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const prompt = getFullRegenerationPrompt(trip);
    const result = await geminiClient.generateContentStream(
      { generationConfig: { responseMimeType: "application/json" } }, 
      prompt, 
      null, 
      controller.signal
    );
    
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write("data: " + JSON.stringify({ type: "chunk", text: chunkText }) + "\n\n");
    }

    let cleanString = fullResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleanString.startsWith('{')) {
      const match = cleanString.match(/\{[\s\S]*\}/);
      if (match) cleanString = match[0];
    }
    const parsed = JSON.parse(cleanString);
    if (!parsed.days || !Array.isArray(parsed.days)) throw new Error("Full regeneration failed validation");

    await geocodePlaces(parsed, trip.destination);

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const dbTrip = await tx.trip.findUnique({ where: { id } });
      if (!dbTrip) throw new Error("Trip not found");

      const currentHistory = Array.isArray(dbTrip.history) ? dbTrip.history : [];
      const newHistory = [...currentHistory, { 
        itinerary: dbTrip.itinerary, 
        overBudget: dbTrip.overBudget,
        timestamp: new Date().toISOString() 
      }].slice(-5);

      const newItinerary = recalculateItinerary(parsed);
      newItinerary.currency = dbTrip.itinerary?.currency || 'INR';

      return tx.trip.update({
        where: { id },
        data: { 
          itinerary: newItinerary, 
          overBudget: newItinerary.totalCost > dbTrip.budget,
          history: newHistory
        }
      });
    });

    res.write("data: " + JSON.stringify({ type: "complete", trip: updatedTrip }) + "\n\n");
    res.end();
  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Full regeneration failed");
    if (!res.headersSent) {
      return res.status(error.message === "Trip not found" ? 404 : 500).json({ error: error.message });
    }
    res.write("data: " + JSON.stringify({ type: "error", message: error.message || "Full regeneration failed" }) + "\n\n");
    res.end();
  }
};
