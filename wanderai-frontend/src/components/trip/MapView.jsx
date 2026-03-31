import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { MapPin, Clock, Banknote, AlertTriangle, Loader2 } from 'lucide-react';

const DAY_COLORS = [
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#06b6d4', // cyan
];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#1a1c1e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#f8f4eb" }, { "opacity": 0.4 }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#10b981" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2a2d30" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }, { "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#33373b" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#131516" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] }
  ]
};

export default function MapView({ days = [], activeDay = 0, onActiveDay, currency = 'INR' }) {
  const [map, setMap] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const formatter = useMemo(() => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }), [currency]);

  const formatCurrency = (val) => formatter.format(val || 0);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const allPlaces = useMemo(() => days.flatMap(d => d.places || [])
    .filter(p => p.lat != null && p.lng != null)
    .map(p => ({
      ...p,
      lat: parseFloat(p.lat) || 0,
      lng: parseFloat(p.lng) || 0
    })), [days]);

  const activePlaces = useMemo(() => days[activeDay]?.places
    ?.filter(p => p.lat != null && p.lng != null)
    .map(p => ({
      ...p,
      lat: parseFloat(p.lat) || 0,
      lng: parseFloat(p.lng) || 0
    })) || [], [days, activeDay]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
    if (activePlaces.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      activePlaces.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds);
    }
  }, [activePlaces]);

  useEffect(() => {
    if (map && activePlaces.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      activePlaces.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds);
      
      // If only one place, zoom in more
      if (activePlaces.length === 1) {
        map.setZoom(14);
      }
    }
  }, [map, activePlaces]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-[#131516] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500 border border-rose-500/20 shadow-glass">
          <AlertTriangle size={32} strokeWidth={1.5} />
        </div>
        <h4 className="text-sm font-black text-parchment-100 uppercase tracking-[0.2em] mb-2">Connection Error</h4>
        <p className="text-[10px] text-parchment-100/40 max-w-xs leading-relaxed font-black uppercase tracking-widest px-4">
          Failed to connect to Google Maps. Please check your internet or API configuration.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-[#131516] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6 text-parchment-100/20">Syncing Cartography</p>
      </div>
    );
  }

  if (allPlaces.length === 0) {
    return (
      <div className="w-full h-full bg-[#131516] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-parchment-100/10 border border-white/5 shadow-inner">
          <MapPin size={32} strokeWidth={1.5} />
        </div>
        <h4 className="text-sm font-black text-parchment-100 uppercase tracking-[0.4em] mb-3">No Destinations Found</h4>
        <p className="text-[10px] text-parchment-100/40 max-w-xs leading-relaxed font-black uppercase tracking-widest">Complete your itinerary to visualize your journey.</p>
      </div>
    );
  }

  const polylinePath = activePlaces.map(p => ({ lat: p.lat, lng: p.lng }));

  return (
    <div className="w-full h-full relative group bg-oyster-100">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        onLoad={onMapLoad}
        options={OPTIONS}
        center={allPlaces[0] ? { lat: allPlaces[0].lat, lng: allPlaces[0].lng } : undefined}
        zoom={12}
      >
        {/* Markers */}
        {activePlaces.map((place, idx) => (
          <Marker
            key={`${activeDay}-${idx}`}
            position={{ lat: place.lat, lng: place.lng }}
            label={{
              text: (idx + 1).toString(),
              color: '#f8f4eb', // oyster-50
              fontSize: '11px',
              fontWeight: '900'
            }}
            onClick={() => setSelectedPlace(place)}
            icon={{
               path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
               fillColor: DAY_COLORS[activeDay % DAY_COLORS.length],
               fillOpacity: 1,
               strokeWeight: 2,
               strokeColor: '#1a1c1e', // deep charcoal stroke
               scale: 16
            }}
          />
        ))}

        {/* Route Polyline */}
        {activePlaces.length > 1 && (
          <Polyline
            path={polylinePath}
            options={{
              strokeColor: DAY_COLORS[activeDay % DAY_COLORS.length],
              strokeOpacity: 0.8,
              strokeWeight: 3,
              clickable: false,
              zIndex: 1,
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                offset: '0',
                repeat: '10px'
              }]
            }}
          />
        )}

        {/* InfoWindow */}
        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-1 min-w-[200px]">
              <h4 className="text-[12px] font-black text-espresso uppercase tracking-tighter mb-2">{selectedPlace.name}</h4>
              <div className="flex gap-3 opacity-60 mb-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-espresso uppercase tracking-widest">
                  <Clock size={12} className="text-emerald" /> {selectedPlace.duration}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-espresso uppercase tracking-widest">
                  <Banknote size={12} className="text-emerald" /> {formatCurrency(selectedPlace.cost)}
                </div>
              </div>
              {selectedPlace.flagged && (
                <div className="pt-1.5 border-t border-lime_cream-600/40 flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                  <AlertTriangle size={10} strokeWidth={3} />
                  Validation Required
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none transition-opacity">
        <div className="bg-[#1a1c1e]/80 backdrop-blur-xl border border-white/5 rounded-[1.2rem] px-5 py-3 shadow-glass flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-parchment-100/20 uppercase tracking-[0.4em] leading-none mb-1.5">Real-time</span>
            <span className="text-[11px] font-black text-parchment-100 uppercase tracking-tighter leading-none">Map Synchronized</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse shadow-glass shadow-emerald/20" />
        </div>
      </div>
    </div>
  );
}
