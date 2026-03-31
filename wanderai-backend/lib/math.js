export function recalculateItinerary(itinerary) {
  if (!itinerary || !Array.isArray(itinerary.days)) return itinerary;

  let totalTripCost = 0;

  const updatedDays = itinerary.days.map((day) => {
    const placesSum = (day.places || []).reduce((acc, p) => acc + (Number(p.cost) || 0), 0);
    const mealsSum = (day.meals || []).reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
    const daySum = placesSum + mealsSum;
    
    totalTripCost += daySum;

    return {
      ...day,
      dayCost: daySum
    };
  });

  return {
    ...itinerary,
    days: updatedDays,
    totalCost: totalTripCost
  };
}
