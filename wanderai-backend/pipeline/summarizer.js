import { geminiClient } from './geminiClient.js';

export async function summarizeTrip(itinerary, intent) {
  const modelOptions = { 
    generationConfig: { responseMimeType: "application/json" }
  };

  const placesVisited = itinerary.days.flatMap(day => day.places.map(place => place.name));
  const hasRain = itinerary.days.some(day => day.weather && day.weather.rain_probability > 30);
  const weatherSummary = hasRain ? "Some days have rain expected." : "No significant rain expected.";

  const prompt = `Return ONLY valid JSON no markdown.
Destination: ${intent.destination}
Number of days: ${intent.days}
Group type: ${intent.groupType}
Places visited: ${placesVisited.join(', ')}
Weather summary: ${weatherSummary}

Return exactly this structure:
{
  "title": "Creative trip title max 8 words",
  "summary": "2 engaging sentences about the trip",
  "packingTips": [
    "5 specific, practical packing tips for this exact destination and weather",
    "Make them relevant to the places visited and group type",
    "Include rain gear tip if rain is expected",
    "Mention local dress codes or cultural norms if relevant",
    "Include a transport or convenience tip"
  ],
  "highlights": [
    "Top must-do experience 1 from the itinerary",
    "Top must-do experience 2 from the itinerary",
    "Top must-do experience 3 from the itinerary"
  ]
}`;

  try {
    const result = await geminiClient.generateContent(modelOptions, prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    return {
      title: intent.destination + " Adventure",
      summary: "An amazing trip to " + intent.destination,
      packingTips: [
        "Pack comfortable walking shoes",
        "Carry a water bottle",
        "Bring sunscreen",
        "Pack light layers",
        "Carry some cash"
      ],
      highlights: [
        "Explore local culture",
        "Try local food",
        "Visit top attractions"
      ]
    };
  }
}
