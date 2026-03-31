export const ITINERARY_STRUCTURE = `{
  "currency": "CURRENCY_CODE",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title string",
      "places": [
        {
          "name": "Exact place name",
          "description": "2 sentence description",
          "duration": "2 hours",
          "cost": 500,
          "type": "sightseeing",
          "lat": null,
          "lng": null,
          "flagged": false
        }
      ],
      "meals": [
        {
          "type": "breakfast",
          "restaurant": "Restaurant name",
          "dish": "Dish name",
          "cost": 300
        }
      ],
      "transport": "Transport description string",
      "accommodation": "Hotel name and cost string",
      "dayCost": 3000,
      "weather": null
    }
  ],
  "totalCost": 18000,
  "budgetConverted": 18000,
  "itineraryBudget": 500000
}`;

export function getPlanningPrompt(intent, isRetry = false) {
  const budgetCurrency = intent.budgetCurrency || 'INR';
  
  const destinationLower = (intent.destination || '').toLowerCase();
  
  const CURRENCY_MAP = {
    'japan': 'JPY', 'tokyo': 'JPY', 'osaka': 'JPY', 'kyoto': 'JPY',
    'thailand': 'THB', 'bangkok': 'THB', 'phuket': 'THB', 'chiang mai': 'THB',
    'vietnam': 'VND', 'hanoi': 'VND', 'ho chi minh': 'VND',
    'singapore': 'SGD',
    'malaysia': 'MYR', 'kuala lumpur': 'MYR',
    'indonesia': 'IDR', 'bali': 'IDR', 'jakarta': 'IDR',
    'south korea': 'KRW', 'seoul': 'KRW',
    'china': 'CNY', 'beijing': 'CNY', 'shanghai': 'CNY',
    'nepal': 'NPR', 'kathmandu': 'NPR',
    'sri lanka': 'LKR', 'colombo': 'LKR',
    'maldives': 'MVR', 'maldive': 'MVR',
    'dubai': 'AED', 'abu dhabi': 'AED', 'uae': 'AED',
    'turkey': 'TRY', 'istanbul': 'TRY',
    'india': 'INR', 'goa': 'INR', 'mumbai': 'INR', 'delhi': 'INR', 
    'bangalore': 'INR', 'bengaluru': 'INR', 'kerala': 'INR', 
    'rajasthan': 'INR', 'manali': 'INR', 'jaipur': 'INR', 'agra': 'INR',
    'shimla': 'INR', 'udaipur': 'INR', 'varanasi': 'INR', 'rishikesh': 'INR',
    'ladakh': 'INR', 'leh': 'INR', 'andaman': 'INR', 'ooty': 'INR',
    'darjeeling': 'INR', 'pune': 'INR', 'kolkata': 'INR', 'hyderabad': 'INR',
    'france': 'EUR', 'paris': 'EUR', 'germany': 'EUR', 'berlin': 'EUR',
    'italy': 'EUR', 'rome': 'EUR', 'milan': 'EUR', 'venice': 'EUR',
    'spain': 'EUR', 'barcelona': 'EUR', 'madrid': 'EUR',
    'greece': 'EUR', 'athens': 'EUR', 'santorini': 'EUR',
    'portugal': 'EUR', 'lisbon': 'EUR',
    'netherlands': 'EUR', 'amsterdam': 'EUR',
    'austria': 'EUR', 'vienna': 'EUR',
    'uk': 'GBP', 'london': 'GBP', 'england': 'GBP', 'scotland': 'GBP',
    'switzerland': 'CHF', 'zurich': 'CHF', 'geneva': 'CHF',
    'czech republic': 'CZK', 'prague': 'CZK',
    'hungary': 'HUF', 'budapest': 'HUF',
    'usa': 'USD', 'new york': 'USD', 'los angeles': 'USD', 'san francisco': 'USD',
    'california': 'USD', 'hawaii': 'USD', 'miami': 'USD', 'las vegas': 'USD',
    'canada': 'CAD', 'toronto': 'CAD', 'vancouver': 'CAD',
    'mexico': 'MXN', 'cancun': 'MXN',
    'brazil': 'BRL', 'rio': 'BRL',
    'australia': 'AUD', 'sydney': 'AUD', 'melbourne': 'AUD',
    'new zealand': 'NZD', 'auckland': 'NZD',
    'south africa': 'ZAR', 'cape town': 'ZAR',
    'egypt': 'EGP', 'cairo': 'EGP',
    'kenya': 'KES', 'nairobi': 'KES',
    'morocco': 'MAD', 'marrakech': 'MAD',
  };

  const STABLE_EXCHANGE_RATES = {
    'INR_TO_JPY': 1.75,   'INR_TO_THB': 0.43,   'INR_TO_VND': 300,
    'INR_TO_SGD': 0.016,  'INR_TO_AED': 0.044,  'INR_TO_MYR': 0.057,
    'INR_TO_IDR': 190,    'INR_TO_KRW': 16.5,   'INR_TO_CNY': 0.086,
    'INR_TO_NPR': 1.6,    'INR_TO_LKR': 3.6,    'INR_TO_MVR': 0.18,
    'INR_TO_TRY': 0.38,
    'INR_TO_EUR': 0.011,  'INR_TO_USD': 0.012,  'INR_TO_GBP': 0.0094,
    'INR_TO_CHF': 0.010,  'INR_TO_CZK': 0.28,   'INR_TO_HUF': 4.3,
    'INR_TO_CAD': 0.016,  'INR_TO_AUD': 0.018,  'INR_TO_NZD': 0.020,
    'INR_TO_MXN': 0.20,   'INR_TO_BRL': 0.060,
    'INR_TO_ZAR': 0.22,   'INR_TO_EGP': 0.58,   'INR_TO_MAD': 0.12,
  };

  let destinationCurrency = 'USD';
  for (const [key, currency] of Object.entries(CURRENCY_MAP)) {
    if (destinationLower.includes(key)) {
      destinationCurrency = currency;
      break;
    }
  }

  const sameCurrency = budgetCurrency === destinationCurrency;
  const perDayBudgetInput = Math.floor(intent.budget / intent.days);

  let budgetInstruction;
  if (sameCurrency) {
    budgetInstruction = `The user's budget is ${intent.budget} ${budgetCurrency} total (${perDayBudgetInput} ${budgetCurrency} per day).
All costs MUST be in ${destinationCurrency}.
Set "currency" field to "${destinationCurrency}".`;
  } else {
    const rateKey = `${budgetCurrency}_TO_${destinationCurrency}`;
    const rate = STABLE_EXCHANGE_RATES[rateKey] || 1;
    const convertedTotal = Math.floor(intent.budget * rate);
    const convertedPerDay = Math.floor(convertedTotal / intent.days);

    budgetInstruction = `IMPORTANT CURRENCY CONVERSION REQUIRED:
The user's original budget is ${intent.budget} ${budgetCurrency}.
EXACT EXCHANGE RATE: 1 ${budgetCurrency} = ${rate} ${destinationCurrency}.
TARGET BUDGET IN ${destinationCurrency}: ${convertedTotal} ${destinationCurrency} (${convertedPerDay} per day).

RULES:
1. ALL costs in the JSON (places, meals, dayCost, totalCost) MUST be in ${destinationCurrency}.
2. Set "currency" field to "${destinationCurrency}".
3. Set "budgetConverted" to ${convertedTotal}.
4. Set "itineraryBudget" to ${intent.budget}.
5. Plan the trip to stay strictly within the converted budget of ${convertedTotal} ${destinationCurrency}.`;
  }

  return `You are a global expert travel planner.
${isRetry ? "IMPORTANT: Your previous response was invalid JSON. Return ONLY raw JSON." : "Return ONLY raw JSON."}
No markdown. No backticks. No explanation.
Start your response with { and end with }

Follow this exact structure:
${ITINERARY_STRUCTURE}

${budgetInstruction}
Use only real existing places with correct names.
Include 3-5 places per day. Include all 3 meals every day.

Plan a trip with these details:
Destination: ${intent.destination}
Number of days: ${intent.days}
Total budget: ${intent.budget} ${budgetCurrency}
Group type: ${intent.groupType}
Interests: ${(intent.interests || []).join(', ')}
Things to avoid: ${(intent.avoid || []).join(', ')}

### GLOBAL FORMATTING RULES ###
- Return ONLY numeric values for all cost fields (cost, dayCost, totalCost, budgetConverted, itineraryBudget).
- NEVER include currency symbols ($, ₹, ¥, €, etc) or commas in these numeric fields.
- Return raw integers or floats only.
- Ensure all itemized costs sum up exactly to the "dayCost" and "totalCost".
Start date: ${intent.startDate}`;
}

export function getOptimizationPrompt(trip, itinerary, percentageOver) {
  const tripCurrency = itinerary.currency || 'INR';
  const isIndia = tripCurrency === 'INR';
  const currencyNote = isIndia
    ? `All costs must be in INR.`
    : `All costs must be in ${tripCurrency}. Also note the INR equivalent in place descriptions for Indian users.`;

  return `You are a travel cost optimizer.
I have a trip to ${trip.destination} for ${trip.days} days
with a budget of ${trip.budget} ${tripCurrency}.
The current itinerary costs ${itinerary.totalCost} ${tripCurrency}
which is ${percentageOver}% over budget.

Here is the current itinerary:
${JSON.stringify(itinerary)}

Please optimize this itinerary to fit within the budget of ${trip.budget} ${tripCurrency}.
Rules:
- Keep the same destinations and days
- Replace expensive places with cheaper alternatives
- Suggest budget accommodations
- Keep the trip enjoyable and worthwhile
- Return the COMPLETE updated itinerary JSON in exactly the same structure
- ${currencyNote}
- Return ONLY valid JSON nothing else`;
}

export function getRegenerationPrompt(trip, originalDay, reason) {
  const tripCurrency = trip.itinerary?.currency || 'INR';
  const perDayBudget = Math.floor(trip.budget / trip.days);

  return `You are a travel planner.
I want to regenerate Day ${originalDay.day} 
of my trip to ${trip.destination}.

Current Day ${originalDay.day} plan:
${JSON.stringify(originalDay)}

Trip context:
- Total days: ${trip.days}
- Budget per day: ${perDayBudget} ${tripCurrency}
- Currency: ${tripCurrency}
- Reason for regeneration: ${reason}

Please create a completely new plan for 
Day ${originalDay.day} with:
- Different places than the current plan (be creative!)
- Same date: ${originalDay.date}
- Stay within per day budget of ${perDayBudget} ${tripCurrency}
- Include 3 to 5 places
- Include all 3 meals (breakfast, lunch, dinner)
- Include transport and accommodation
- All costs in ${tripCurrency}

Return ONLY the day object JSON in this EXACT structure:
{
  "day": ${originalDay.day},
  "date": "${originalDay.date}",
  "title": "Dynamic Day Title",
  "places": [
    {
      "name": "Place Name",
      "description": "Short description",
      "duration": "2 hours",
      "cost": 100,
      "type": "sightseeing",
      "lat": null,
      "lng": null,
      "flagged": false
    }
  ],
  "meals": [
    {
      "type": "breakfast",
      "restaurant": "Restaurant Name",
      "dish": "Dish Name",
      "cost": 50
    }
  ],
  "transport": "Transport description",
  "accommodation": "Accommodation if applicable",
  "dayCost": 150,
  "weather": null
}
Return ONLY valid JSON nothing else`;
}

export function getFullRegenerationPrompt(trip) {
  const tripCurrency = trip.itinerary?.currency || 'INR';

  return `You are a travel planner.
I want to REGENERATE the ENTIRE itinerary for my trip to ${trip.destination}.

Trip context:
- Total days: ${trip.days}
- Total budget: ${trip.budget} ${tripCurrency}
- Currency: ${tripCurrency}
- Current Destination: ${trip.destination}

Please create a completely new, high-quality ${trip.days}-day plan. 
Rules:
- Professional, creative titles for each day.
- Exactly ${trip.days} days in the "days" array.
- Stay within total budget of ${trip.budget} ${tripCurrency}.
- Use real existing places.
- Include 3 to 5 places per day.
- Include 3 meals per day.
- All costs must be in ${tripCurrency}.

Return the COMPLETE itinerary JSON in this exact structure:
${ITINERARY_STRUCTURE}

Return ONLY valid JSON nothing else.`;
}
