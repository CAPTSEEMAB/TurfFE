import { useState } from 'react';
import { useFetch } from '@/hooks/useApi';
import { Turf } from '@/types';
import { API_ENDPOINTS } from '@/lib/api';
import MapView from '@/components/MapView';
import { PageLayout, PageHeader, LoadingState, ErrorState } from '@/components/common/PageComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';

const TurfMapPage = () => {
  const { data: turfs, loading, error } = useFetch<Turf[]>(API_ENDPOINTS.TURFS);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  return (
    <PageLayout>
      <PageHeader
        title="Turf Locations"
        subtitle="Find turfs near you on the map"
        icon={<MapIcon className="w-8 h-8" />}
      />

      {loading && <LoadingState message="Loading turfs and map..." />}
      {error && <ErrorState message={error} />}

      {turfs && turfs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map - Takes 3/4 on desktop */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <MapView turfs={turfs} onTurfClick={setSelectedTurf} />
              </CardContent>
            </Card>
          </div>

          {/* Selected Turf Details - Takes 1/4 on desktop */}
          <div className="lg:col-span-1">
            {selectedTurf ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedTurf.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedTurf.location_description}</p>
                  </div>
                  {selectedTurf.images && selectedTurf.images.length > 0 && (
                    <img
                      src={selectedTurf.images[0]}
                      alt={selectedTurf.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <a
                    href={`/turf/${selectedTurf.id}`}
                    className="block mt-4 px-3 py-2 bg-primary text-white rounded text-center text-sm hover:bg-primary/90"
                  >
                    View Full Details
                  </a>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Click on a marker to see turf details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TurfMapPage;
