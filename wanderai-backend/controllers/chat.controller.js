import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkTripAccess } from '../lib/checkTripAccess.js';

import { geminiClient } from '../pipeline/geminiClient.js';

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string()
  })).default([])
});

export const chatWithTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const validation = chatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed" });
    }
    const { message, history } = validation.data;

    // Allow both owners AND collaborators to use the chat
    const access = await checkTripAccess(id, req.userId, false, req.userEmail);
    if (!access.authorized) {
      return res.status(access.status).json({ error: access.error });
    }

    const trip = access.trip;
    const it = trip.itinerary;
    const tripCurrency = it?.currency || 'INR';

    const controller = new AbortController();
    req.on('close', () => {
      console.log("[Chat Controller] SSE connection closed by client.");
      controller.abort();
    });

    // Build compact trip context for the model
    let daysString = "";
    if (it && Array.isArray(it.days)) {
      daysString = it.days.map(day => {
        const p = (day.places || []).map(pl => pl.name).join(", ");
        const m = (day.meals || []).map(ml => ml.restaurant).join(", ");
        const w = day.weather ? `${day.weather.conditions} (${day.weather.temp_min}-${day.weather.temp_max}°C)` : 'N/A';
        return `D${day.day}: ${p} | Meals: ${m} | Stay: ${day.accommodation || 'N/A'} | Cost: ${day.dayCost} ${tripCurrency} | Weather: ${w}`;
      }).join("\n");
    }

    const systemInstruction = `You are a helpful travel assistant for WanderAI. Access the context below to answer specific questions. If costs exceed the budget (${trip.budget} ${tripCurrency}), mention it. Keep answers under 100 words.

CONTEXT:
Destination: ${trip.destination}
Duration: ${trip.days} days
Budget: ${trip.budget} ${tripCurrency}
Current Est: ${it?.totalCost || 0} ${tripCurrency}

ITINERARY:
${daysString}`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Cap history at last 10 turns (20 msgs) to avoid token overflow
    const cappedHistory = history.slice(-20);
    
    // Map roles to Google format (assistant -> model)
    const contents = cappedHistory.map(h => ({ 
      role: h.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: h.text }] 
    }));
    
    contents.push({ role: "user", parts: [{ text: message }] });

    const result = await geminiClient.generateContentStream({}, { contents }, systemInstruction, controller.signal);

    let accumulatedText = "";
    for await (const chunk of result.stream) {
      if (controller.signal.aborted) break;
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      res.write("data: " + JSON.stringify({ type: "chunk", text: chunkText }) + "\n\n");
    }

    res.write("data: " + JSON.stringify({ type: "complete", fullResponse: accumulatedText }) + "\n\n");
    res.end();

  } catch (error) {
    req.log.error({ err: error, tripId: req.params.id }, "Chat controller crashed");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Chat failed" });
    }
    res.write("data: " + JSON.stringify({ type: "error", message: "Chat failed. Please try again." }) + "\n\n");
    res.end();
  }
};
