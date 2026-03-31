import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function findNichePlaces(query, destination) {
  if (!GOOGLE_PLACES_API_KEY) return [];

  try {
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const response = await axios.post(searchUrl, 
      {
        textQuery: `${query} in ${destination}`,
        maxResultCount: 3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.editorialSummary'
        }
      }
    );

    return (response.data.places || []).filter(p => p.displayName?.text).map(p => ({
      name: p.displayName.text,
      address: p.formattedAddress,
      rating: p.rating,
      reviews: p.userRatingCount,
      description: p.editorialSummary?.text || ""
    }));
  } catch (error) {
    return [];
  }
}
