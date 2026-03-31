import { create } from 'zustand';

export const useTripStore = create((set) => ({
  activeTrip: null,
  presence: [],
  collaborators: [],
  
  trips: [],
  tripCache: {},
  isLoading: false,
  error: null,

  setActiveTrip: (trip) => set({ activeTrip: trip }),
  updateTrip: (updates) => set((state) => ({ 
    activeTrip: state.activeTrip 
      ? typeof updates === 'function' 
        ? updates(state.activeTrip) 
        : { ...state.activeTrip, ...updates }
      : null 
  })),
  clearTrip: () => set({ activeTrip: null, presence: [], collaborators: [], typingUsers: {} }),
  setPresence: (users) => set({ presence: Array.isArray(users) ? users : [] }),
  setCollaborators: (list) => set({ collaborators: Array.isArray(list) ? list : [] }),
  
  syncTripState: (updatedTrip) => set((state) => ({
    activeTrip: updatedTrip,
    tripCache: { ...state.tripCache, [updatedTrip.id]: updatedTrip },
    trips: state.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
  })),

  setTrips: (trips) => set({ trips, isLoading: false, error: null }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  removeTrip: (tripId) => set((state) => ({ 
    trips: state.trips.filter(t => t.id !== tripId) 
  })),
  updateListItem: (updatedTrip) => set((state) => ({
    trips: state.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
  })),
  setStoreLoading: (isLoading) => set({ isLoading }),
  setStoreError: (error) => set({ error, isLoading: false }),
}));
