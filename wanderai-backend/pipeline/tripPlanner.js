import { geminiClient } from './geminiClient.js';
import { getPlanningPrompt } from '../lib/prompts.js';

export async function planTrip(intent, res, signal) {
  const modelOptions = { 
    generationConfig: { responseMimeType: "application/json" }
  };

  const prompt = getPlanningPrompt(intent);

  try {
    const result = await geminiClient.generateContentStream(modelOptions, prompt, null, signal);
    
    let fullText = "";
    for await (const chunk of result.stream) {
      if (signal?.aborted) {
        console.log("[TripPlanner] Client disconnected, aborting generation.");
        break;
      }
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write("data: " + JSON.stringify({ 
        type: "chunk", text: chunkText 
      }) + "\n\n");
    }

    return fullText;
  } catch (error) {
    throw error;
  }
}
