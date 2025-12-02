import { useEffect, useRef, useState } from 'react';
import GoogleMapsService from '@/lib/googleMapsService';
import { Turf } from '@/types';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapViewProps {
  turfs: Turf[];
  onTurfClick?: (turf: Turf) => void;
  showSearchNearby?: boolean;
}

const MapView = ({ turfs, onTurfClick, showSearchNearby = true }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapsServiceRef = useRef<GoogleMapsService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        // Load Google Maps script
        await GoogleMapsService.loadGoogleMapsScript(apiKey);

        // Initialize service
        mapsServiceRef.current = new GoogleMapsService();
        mapsServiceRef.current.initializeMap({
          apiKey,
          mapContainerId: 'map-container',
          center: { lat: 28.6139, lng: 77.209 }, // Delhi
          zoom: 12,
        });

        // Add turf markers
        const turfLocations = turfs.map((turf) => ({
          id: turf.id,
          name: turf.name,
          lat: turf.latitude || 28.6139,
          lng: turf.longitude || 77.209,
          address: turf.location_description,
          image_url: turfs && turfs.length > 0 ? turfs[0].images?.[0] : undefined,
        }));

        mapsServiceRef.current.addTurfMarkers(turfLocations);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    initializeMap();
  }, [turfs]);

  // Get user location
  const handleGetUserLocation = async () => {
    try {
      if (!mapsServiceRef.current) return;

      setLoading(true);
      const location = await mapsServiceRef.current.getCurrentLocation();
      setUserLocation(location);
      mapsServiceRef.current.centerMap(location.lat, location.lng);
      setLoading(false);
    } catch (err) {
      setError('Unable to get your location');
      setLoading(false);
    }
  };

  // Filter nearby turfs
  const handleNearbySearch = async () => {
    try {
      if (!mapsServiceRef.current || !userLocation) {
        await handleGetUserLocation();
        return;
      }

      const nearbyTurfs = mapsServiceRef.current.filterTurfsByDistance(
        turfs.map((turf) => ({
          id: turf.id,
          name: turf.name,
          lat: turf.latitude || 28.6139,
          lng: turf.longitude || 77.209,
          address: turf.location_description,
          image_url: turf.images?.[0],
        })),
        userLocation,
        5 // 5 km radius
      );

      // You could filter the turfs here or show on map
      // For now, just center on user location
      mapsServiceRef.current.centerMap(userLocation.lat, userLocation.lng);
    } catch (err) {
      setError('Unable to search nearby turfs');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        id="map-container"
        className="flex-1 rounded-lg border border-border shadow-sm"
        style={{ minHeight: '500px' }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full bg-muted">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full bg-destructive/10">
            <p className="text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {showSearchNearby && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleGetUserLocation}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <MapPin className="w-4 h-4" />
            My Location
          </Button>
          <Button
            onClick={handleNearbySearch}
            variant="default"
            className="gap-2"
            disabled={loading}
          >
            <Navigation className="w-4 h-4" />
            Nearby Turfs (5km)
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;
