import { findNichePlaces } from '../lib/places.js';

// Enhances the itinerary with real-world ratings and metadata
export async function enrichPlaces(itinerary, destination) {
  await Promise.all(itinerary.days.map(async (day) => {
    if (!day.places || day.places.length === 0) return;

    const targetPlace = day.places[0]; 
    try {
      const nicheSpots = await findNichePlaces(targetPlace.name, destination);

      if (nicheSpots.length > 0) {
        const bestMatch = nicheSpots[0];
        targetPlace.name = bestMatch.name;
        targetPlace.description = bestMatch.description || targetPlace.description;
        targetPlace.metadata = {
          rating: bestMatch.rating,
          reviews: bestMatch.reviews,
          address: bestMatch.address,
          isHiddenGem: bestMatch.rating > 4.5 && bestMatch.reviews < 500
        };
      }
    } catch (err) {
      // Silently skip enrichment failures for individual days
    }
  }));

  return itinerary;
}
