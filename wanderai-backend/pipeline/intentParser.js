import { z } from 'zod';
import { geminiClient } from './geminiClient.js';
import appLogger from '../lib/logger.js';

const intentSchema = z.object({
  destination: z.string().min(2),
  days: z.number().int().min(1).max(30).default(3),
  budget: z.number().nullable().default(null),
  budgetCurrency: z.string().default("INR"),
  groupType: z.enum(["solo", "couple", "family", "friends"]).default("solo"),
  interests: z.array(z.string()).default([]),
  avoid: z.array(z.string()).default([]),
  startDate: z.string().nullable().default(null)
});

export async function parseIntent(userText, hints = {}, signal) {
  const modelOptions = { 
    generationConfig: { responseMimeType: "application/json" }
  };

  const hintText = [];
  if (hints.groupType) hintText.push(`- USER PREFERENCE: groupType MUST be "${hints.groupType}"`);
  if (hints.interests?.length > 0) hintText.push(`- USER PREFERENCE: include these interests: ${hints.interests.join(', ')}`);

  const prompt = `SYSTEM: you are a travel intent extractor.
Return ONLY valid JSON with these fields:
- destination: (string, e.g. "Tokyo, Japan")
- days: (number, integer only, default 3 if not mentioned)
- budget: (number or null — integer only, remove ALL currency symbols like $, ₹, €, and commas. Return null if NO budget is mentioned at all. Do NOT invent a budget. If user says "lakh" multiply by 100000, if "k" multiply by 1000.)
- budgetCurrency: (string — the ISO 4217 currency code of the budget the USER specified. If user uses ₹ or mentions INR or rupees, return "INR". If $ or USD, return "USD". If € or EUR, return "EUR". If £ or GBP, return "GBP". Default to "INR" if unclear.)
- groupType: (string: "solo", "couple", "family", "friends" — infer from context, default "solo")
- interests: (array of strings — infer from trip type if not explicit)
- avoid: (array of strings)
- startDate: (string "YYYY-MM-DD" or null if not mentioned)

${hintText.length > 0 ? "### OVERRIDE HINTS ###\n" + hintText.join('\n') : ""}

### TRIP INTENT REQUEST ###
USER_INPUT: ${userText}
### END TRIP INTENT REQUEST ###`;

  try {
    const result = await geminiClient.generateContent(modelOptions, prompt, null, signal);
    let text = result.response.text().trim();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!text.startsWith('{')) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) text = match[0];
    }

    const parsed = JSON.parse(text);
    const validation = intentSchema.safeParse(parsed);
    
    if (!validation.success) {
      if (!parsed.destination) throw new Error("Could not determine destination.");
      
      let sanitizedBudget = null;
      if (parsed.budget !== undefined && parsed.budget !== null) {
        const raw = String(parsed.budget).replace(/[^\d.-]/g, '');
        sanitizedBudget = parseFloat(raw) || null;
      }

      return { 
        ...parsed, 
        days: parseInt(parsed.days) || 3, 
        budget: sanitizedBudget,
        groupType: parsed.groupType || "solo",
        interests: parsed.interests || [],
        avoid: parsed.avoid || [],
        startDate: parsed.startDate || null
      };
    }

    return validation.data;
  } catch (error) {
    appLogger.error({ err: error, input: userText.substring(0, 100) }, "Intent parsing failed");
    throw new Error("I couldn't quite understand that trip request. Please try being more specific about the destination and days.");
  }
}
