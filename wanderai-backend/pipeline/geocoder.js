import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function geocodePlace(place, destination) {
  if (!GOOGLE_API_KEY) {
    console.error("[Geocoder] Missing GOOGLE_MAPS_API_KEY. Falling back to flagged coordinates.");
    place.lat = null;
    place.lng = null;
    place.flagged = true;
    return place;
  }

  const query = `${place.name}, ${destination}`;
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { 
        address: query,
        key: GOOGLE_API_KEY
      },
      timeout: 10000
    });

    if (response.data && response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      place.lat = location.lat;
      place.lng = location.lng;
      place.flagged = false;
    } else {
      console.warn(`[Geocoder] No results for: ${query} (Status: ${response.data.status})`);
      place.lat = null;
      place.lng = null;
      place.flagged = true;
    }
  } catch (error) {
    console.error(`[Geocoder] Error for ${query}:`, error.message);
    place.lat = null;
    place.lng = null;
    place.flagged = true;
  }
  return place;
}

export async function geocodePlaces(itinerary, destination) {
  const allPlaces = [];
  for (const day of itinerary.days) {
    for (const place of day.places) {
      allPlaces.push(place);
    }
  }

  const BATCH_SIZE = 10;
  for (let i = 0; i < allPlaces.length; i += BATCH_SIZE) {
    const batch = allPlaces.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(place => geocodePlace(place, destination)));
  }

  return itinerary;
}
