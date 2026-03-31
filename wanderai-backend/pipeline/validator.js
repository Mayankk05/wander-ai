import { z } from 'zod';
import { getPlanningPrompt } from '../lib/prompts.js';
import prisma from '../lib/prisma.js';
import { geminiClient } from './geminiClient.js';

export const placeSchema = z.object({
  name: z.string(),
  description: z.string(),
  duration: z.string().default("1-2 hours"),
  cost: z.coerce.number().default(0),
  type: z.string().default("sightseeing"),
  lat: z.coerce.number().nullable().default(null),
  lng: z.coerce.number().nullable().default(null),
  flagged: z.boolean().default(false)
});

export const mealSchema = z.object({
  type: z.string(),
  restaurant: z.string().default("Local Eatery"),
  dish: z.string().default("Chef's Specialty"),
  cost: z.coerce.number().default(0)
});

export const daySchema = z.object({
  day: z.coerce.number(),
  date: z.string().default("Day 1"),
  title: z.string().default("Exploring the Unknown"),
  places: z.array(placeSchema).default([]),
  meals: z.array(mealSchema).default([]),
  transport: z.string().default("walking"),
  accommodation: z.string().nullable().default(null),
  dayCost: z.coerce.number().default(0),
  weather: z.any().nullable().default(null)
});

export const itinerarySchema = z.object({
  days: z.array(daySchema).min(1),
  totalCost: z.coerce.number().default(0),
  currency: z.string().default("INR"),
  budgetConverted: z.coerce.number().optional()
});

const MAX_RETRIES = 2;

export async function validateItinerary(jsonString, intent, res, tripId = null, retryCount = 0) {
  let parsed;
  try {
    let cleanString = jsonString
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\n\r]/g, " ")
      .trim();

    const jsonMatch = cleanString.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanString = jsonMatch[0];
    
    parsed = JSON.parse(cleanString);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      return await retryPlanning(intent, res, retryCount + 1);
    }
    throw new Error("Failed to parse itinerary. Please refine your request.");
  }

  const result = itinerarySchema.safeParse(parsed);
  
  if (!result.success) {
    if (retryCount < MAX_RETRIES) {
      return await retryPlanning(intent, res, retryCount + 1);
    }
    throw new Error("Itinerary validation failed. Please try a different request.");
  }

  return result.data;
}

export async function retryPlanning(intent, res, retryCount) {
  const modelOptions = { 
    generationConfig: { responseMimeType: "application/json" }
  };

  const prompt = getPlanningPrompt(intent, true);

  try {
    const result = await geminiClient.generateContentStream(modelOptions, prompt);
    
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      if (res && typeof res.write === 'function') {
        res.write("data: " + JSON.stringify({ 
          type: "chunk", text: chunkText 
        }) + "\n\n");
      }
    }

    return await validateItinerary(fullResponse, intent, res, null, retryCount);
  } catch (error) {
    console.error("Planning retry failed:", error.message);
    throw new Error("Regeneration failed: " + error.message);
  }
}
