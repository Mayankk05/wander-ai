import { useEffect, useCallback, useRef } from 'react';
import { tripsAPI } from '../api';
import { useTripStore } from '../store/tripStore';

export function useTrips() {
  const trips = useTripStore(state => state.trips);
  const isLoading = useTripStore(state => state.isLoading);
  const error = useTripStore(state => state.error);
  const setTrips = useTripStore(state => state.setTrips);
  const setStoreLoading = useTripStore(state => state.setStoreLoading);
  const setStoreError = useTripStore(state => state.setStoreError);
  const removeTrip = useTripStore(state => state.removeTrip);
  const updateListItem = useTripStore(state => state.updateListItem);

  const isInitialMount = useRef(true);

  const fetchTrips = useCallback(async (isBackground = false) => {
    const currentTrips = useTripStore.getState().trips;
    if (!isBackground && currentTrips.length === 0) {
      setStoreLoading(true);
    }
    
    try {
      const res = await tripsAPI.getAll();
      setTrips(res.data.trips || []);
    } catch (err) {
      console.error("[useTrips] Error:", err);
      const msg = err.response?.data?.error || 'Failed to reach our servers.';
      if (currentTrips.length === 0) {
        setStoreError(msg);
      }
    }
  }, [setTrips, setStoreLoading, setStoreError]);

  useEffect(() => {
    fetchTrips(useTripStore.getState().trips.length > 0);
  }, [fetchTrips]);

  return {
    trips,
    isLoading: isLoading && trips.length === 0,
    error,
    refresh: () => fetchTrips(false),
    updateTrip: updateListItem,
    removeTrip
  };
}
