import { useParams } from "react-router-dom";
import { useFetch } from "@/hooks/useApi";
import { Turf } from "@/types";
import { formatOperatingHours, getGoogleMapsUrl, getDirectionsUrl, getOsmEmbedUrl } from "@/lib/utils/helpers";
import Navigation from "@/components/Navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import turfBanner from "@/assets/turf-banner.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, Users, Wifi, Phone, Mail, Map, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/api";
import { LoadingState, ErrorState } from "@/components/common/PageComponents";

const CONTACT_EMAIL = 'shaikhseemab10@gmail.com';
const CONTACT_PHONE = '+353894099278';

// Detailed turf view with images, amenities, pricing, location map, and booking form
const TurfDetail = () => {
  const { id: turfId } = useParams();
  
  const { data, loading, error, refetch } = useFetch<Turf | { turf: Turf }>(
    turfId ? `${API_ENDPOINTS.TURFS}/${turfId}` : ''
  );
  
  const turf: Turf | null = data 
    ? (data as { turf?: Turf }).turf ?? (data as Turf)
    : null;

  if (!turfId) return <div className="p-8 text-center">No turf selected.</div>;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <LoadingState message="Loading turf details..." />
      </div>
    );
  }
  
  if (error || !turf) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ErrorState message={error || "Turf not found"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Image Carousel */}
        <div className="mb-8 overflow-hidden rounded-2xl shadow-card">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            className="w-full"
          >
            <CarouselContent>
              {(turf.images && turf.images.length > 0 ? turf.images : [turfBanner]).map(
                (url, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={url}
                        alt={`${turf.name} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="mb-2 text-4xl font-bold">{turf.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{turf.location}</span>
                    {turf.latitude && turf.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${turf.latitude},${turf.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Map
                      </a>
                    )}
                  </div>
                </div>
                {turf.is_active === false && (
                  <Badge variant="secondary" className="text-base px-4 py-2 bg-red-600 text-white">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-lg text-foreground/80">{turf.description}</p>
            </div>

            {/* Amenities */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {turf.amenities && turf.amenities.length > 0 ? (
                    turf.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 rounded-lg bg-muted/50 p-3"
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          {amenity === "WiFi" ? (
                            <Wifi className="h-4 w-4 text-primary" />
                          ) : (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No amenities listed.</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold">Operating Hours</h2>
                <div className="flex items-center gap-3 text-lg">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="font-medium">
                    {formatOperatingHours(turf.open_time, turf.close_time)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Open 7 days a week</p>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Turf Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sport Type</p>
                    <p className="font-medium capitalize">{turf.sport_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Surface</p>
                    <p className="font-medium capitalize">{turf.surface_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{turf.capacity || "N/A"} players</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Slot Duration</p>
                    <p className="font-medium">{turf.slot_minutes || "N/A"} mins</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium">{turf.currency || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timezone</p>
                    <p className="font-medium text-xs">{turf.timezone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buffer Time</p>
                    <p className="font-medium">{turf.buffer_minutes || "N/A"} mins</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Time</p>
                    <p className="font-medium">{turf.lead_time_minutes || "N/A"} mins</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Book Ahead</p>
                    <p className="font-medium">{turf.bookable_days_ahead || "N/A"} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-xs">
                      {turf.latitude && turf.longitude
                        ? `${turf.latitude}, ${turf.longitude}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            {turf.latitude && turf.longitude && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Location Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video w-full overflow-hidden rounded-b-lg">
                    <iframe
                      title="Turf Location Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={getOsmEmbedUrl(turf.latitude, turf.longitude)}
                    />
                  </div>
                  <div className="p-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 transition-spring hover:scale-105"
                      asChild
                    >
                      <a
                        href={getGoogleMapsUrl(turf.latitude, turf.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 transition-spring hover:scale-105"
                      asChild
                    >
                      <a
                        href={getDirectionsUrl(turf.latitude, turf.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pricing Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-card-hover">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                    <Euro className="h-8 w-8" />
                    <span>{turf.price_per_hour}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground mb-6">
                  <p>• Premium quality turf</p>
                  <p>• Professional equipment available</p>
                  <p>• Easy booking process</p>
                  <p>• Flexible timing</p>
                </div>
                <div className="space-y-3">
                  <Button 
                    className="w-full gradient-primary hover:shadow-glow transition-spring hover:scale-105" 
                    asChild
                  >
                    <a href={`tel:${CONTACT_PHONE}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call to Book
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full transition-spring hover:scale-105"
                    asChild
                  >
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Booking Inquiry - ${turf.name}&body=Hi,%0D%0A%0D%0AI am interested in booking ${turf.name} located at ${turf.location}.%0D%0A%0D%0APlease let me know the availability and booking process.%0D%0A%0D%0AThank you.`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetail;
