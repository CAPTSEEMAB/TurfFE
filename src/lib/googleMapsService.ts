/**
 * Google Maps API integration for displaying turf locations
 */

interface MapOptions {
  apiKey: string;
  mapContainerId: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface TurfLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  image_url?: string;
}

export class GoogleMapsService {
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private infoWindows: google.maps.InfoWindow[] = [];

  /**
   * Initialize Google Maps
   */
  static loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize the map
   */
  initializeMap(options: MapOptions): google.maps.Map {
    const container = document.getElementById(options.mapContainerId);
    if (!container) {
      throw new Error(`Map container with id '${options.mapContainerId}' not found`);
    }

    this.map = new google.maps.Map(container, {
      center: options.center || { lat: 28.6139, lng: 77.209 }, // Default to Delhi
      zoom: options.zoom || 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    return this.map;
  }

  /**
   * Add markers for turfs
   */
  addTurfMarkers(turfs: TurfLocation[]): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    // Clear existing markers and info windows
    this.clearMarkers();

    turfs.forEach((turf) => {
      const marker = new google.maps.Marker({
        position: { lat: turf.lat, lng: turf.lng },
        map: this.map,
        title: turf.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4F46E5',
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-bold text-lg mb-2">${turf.name}</h3>
            ${turf.address ? `<p class="text-sm text-gray-600 mb-2">${turf.address}</p>` : ''}
            ${turf.image_url ? `<img src="${turf.image_url}" alt="${turf.name}" class="w-full h-32 object-cover rounded mb-2">` : ''}
            <a href="/turf/${turf.id}" class="text-blue-500 text-sm hover:underline">View Details →</a>
          </div>
        `,
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all other info windows
        this.infoWindows.forEach((iw) => iw.close());
        // Open this info window
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
      this.infoWindows.push(infoWindow);
    });

    // Adjust map bounds to fit all markers
    this.fitMarkerBounds();
  }

  /**
   * Fit map bounds to all markers
   */
  private fitMarkerBounds(): void {
    if (!this.map || this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach((marker) => {
      bounds.extend(marker.getPosition()!);
    });
    this.map.fitBounds(bounds);

    // Add padding
    const listener = google.maps.event.addListener(this.map, 'idle', () => {
      this.map?.setZoom(Math.max(this.map.getZoom() - 1, 10));
      google.maps.event.removeListener(listener);
    });
  }

  /**
   * Clear all markers from map
   */
  clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.infoWindows.forEach((iw) => iw.close());
    this.markers = [];
    this.infoWindows = [];
  }

  /**
   * Get user's current location
   */
  getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }

  /**
   * Center map to a specific location
   */
  centerMap(lat: number, lng: number, zoom = 15): void {
    if (!this.map) return;
    this.map.setCenter({ lat, lng });
    this.map.setZoom(zoom);
  }

  /**
   * Search for nearby turfs (using distance calculation)
   */
  filterTurfsByDistance(
    turfs: TurfLocation[],
    center: { lat: number; lng: number },
    radiusKm: number
  ): TurfLocation[] {
    return turfs.filter((turf) => {
      const distance = this.calculateDistance(
        center.lat,
        center.lng,
        turf.lat,
        turf.lng
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default GoogleMapsService;
