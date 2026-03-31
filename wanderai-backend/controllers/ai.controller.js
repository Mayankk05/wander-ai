import { parseIntent } from '../pipeline/intentParser.js';
import { planTrip } from '../pipeline/tripPlanner.js';
import { validateItinerary } from '../pipeline/validator.js';
import { geocodePlaces } from '../pipeline/geocoder.js';
import { summarizeTrip } from '../pipeline/summarizer.js';
import { enrichPlaces } from '../pipeline/placesEnricher.js';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';
import { z } from 'zod';
import { fetchDestinationImage } from '../lib/unsplash.js';

import { aiGenerateSchema } from '../lib/schemas.js';

export async function generateTrip(req, res, next) {
  try {
    const data = req.validatedData?.query || req.query;
    const { prompt: userText, groupType, interests } = data;

    let interestsArray = [];
    if (interests) {
      if (Array.isArray(interests)) {
        interestsArray = interests;
      } else if (typeof interests === 'string') {
        interestsArray = interests.split(',').map(i => i.trim()).filter(Boolean);
      }
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const controller = new AbortController();
    req.on('close', () => {
      console.log("[AI Controller] SSE connection closed by client.");
      controller.abort();
    });

    res.write("data: " + JSON.stringify({ type: "status", message: "Understanding your trip request..." }) + "\n\n");

    const intent = await parseIntent(userText, { groupType, interests: interestsArray }, controller.signal);

    res.write("data: " + JSON.stringify({ type: "status", message: "Generating your itinerary..." }) + "\n\n");
    const fullResponse = await planTrip(intent, res, controller.signal);
    
    if (controller.signal.aborted) return res.end();

    res.write("data: " + JSON.stringify({ type: "status", message: "Validating itinerary..." }) + "\n\n");
    const validatedItinerary = await validateItinerary(fullResponse, intent, res);

    res.write("data: " + JSON.stringify({ type: "status", message: "Finalizing your journey..." }) + "\n\n");
    
    let budgetValue = parseInt(intent.budget) || 0;
    
    // Store the converted budget if the AI provided one, otherwise store original
    const itineraryCurrency = validatedItinerary.currency || 'INR';
    const convertedBudget = validatedItinerary.budgetConverted || budgetValue;
    
    const initialTrip = await prisma.trip.create({
      data: {
        title: intent.destination,
        destination: intent.destination,
        days: parseInt(intent.days) || 1,
        budget: (intent.budgetCurrency && intent.budgetCurrency !== itineraryCurrency) 
          ? convertedBudget 
          : budgetValue,
        itinerary: validatedItinerary,
        imageUrl: null,
        isPublic: false,
        shareLink: crypto.randomUUID(),
        overBudget: (validatedItinerary.totalCost || 0) > convertedBudget,
        userId: req.userId
      }
    });

    let currentItinerary = validatedItinerary;
    let currentImageUrl = null;
    let currentSummary = { title: intent.destination };

    try {
      // Parallel enrichment/summary
      res.write("data: " + JSON.stringify({ type: "status", message: "Enriching your journey..." }) + "\n\n");
      
      // Clone for enrichment to avoid mutation conflicts
      const itineraryForEnrichment = JSON.parse(JSON.stringify(currentItinerary));
      
      const [geocodedItinerary, enrichedItinerary, summary, imageUrl] = await Promise.all([
        geocodePlaces(currentItinerary, intent.destination),
        enrichPlaces(itineraryForEnrichment, intent.destination),
        summarizeTrip(currentItinerary, intent),
        fetchDestinationImage(intent.destination)
      ]);

      // Merge: take geocoded coordinates + enriched metadata into final itinerary
      for (let i = 0; i < geocodedItinerary.days.length; i++) {
        const geoDay = geocodedItinerary.days[i];
        const enrichDay = enrichedItinerary.days[i];
        for (let j = 0; j < geoDay.places.length; j++) {
          // Keep geocoded lat/lng
          enrichDay.places[j].lat = geoDay.places[j].lat;
          enrichDay.places[j].lng = geoDay.places[j].lng;
          enrichDay.places[j].flagged = geoDay.places[j].flagged;
        }
      }

      currentItinerary = enrichedItinerary;
      currentImageUrl = imageUrl;
      currentSummary = summary;

      const finalBudgetInDestCurrency = (intent.budgetCurrency && intent.budgetCurrency !== itineraryCurrency) 
        ? convertedBudget 
        : budgetValue;
      const overBudget = finalBudgetInDestCurrency > 0 && currentItinerary.totalCost > finalBudgetInDestCurrency * 1.15;

      const savedTrip = await prisma.trip.update({
        where: { id: initialTrip.id },
        data: {
          title: summary.title,
          itinerary: currentItinerary,
          imageUrl: currentImageUrl,
          overBudget
        }
      });

      res.write("data: " + JSON.stringify({
        type: "complete",
        trip: { ...savedTrip, summary: currentSummary }
      }) + "\n\n");
      
    } catch (enrichmentError) {
      console.warn("[AI Controller] Enrichment partial failure:", enrichmentError.message);
      
      res.write("data: " + JSON.stringify({
        type: "complete",
        trip: { ...initialTrip, summary: currentSummary, error: "Partial enrichment failure" }
      }) + "\n\n");
    }
    
    res.end();
  } catch (error) {
    if (res.headersSent) {
      if (!controller.signal.aborted) {
        res.write("data: " + JSON.stringify({ type: "error", message: error.message || "Internal Server Error" }) + "\n\n");
      }
      return res.end();
    }
    next(error);
  }
}
