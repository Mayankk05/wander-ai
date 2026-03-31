import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Fetches a single high-quality photo URL based on a query
export const fetchDestinationImage = async (query, random = false) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY not configured. Skipping image fetch.");
    return null;
  }

  try {
    const endpoint = random 
      ? 'https://api.unsplash.com/photos/random' 
      : 'https://api.unsplash.com/search/photos';

    const params = random 
      ? { query: `${query} travel destination landmark`, orientation: 'landscape', client_id: UNSPLASH_ACCESS_KEY }
      : { query: `${query} travel destination landmark`, orientation: 'landscape', per_page: 1, client_id: UNSPLASH_ACCESS_KEY };

    const response = await axios.get(endpoint, { params });

    if (random) {
      return response.data?.urls?.regular;
    }

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error.response?.data || error.message);
    return null;
  }
};
