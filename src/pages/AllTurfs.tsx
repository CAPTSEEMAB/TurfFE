import { useFetch, useSearch } from '@/hooks/useApi';
import { Turf } from '@/types';
import { API_ENDPOINTS } from '@/lib/api';
import TurfCard from '@/components/TurfCard';
import { 
  PageLayout, 
  PageHeader, 
  SearchBar, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  ResultCount 
} from '@/components/common/PageComponents';

// Page for browsing and searching available turfs for booking
const AllTurfs = () => {
  const { data: turfs, loading, error, refetch } = useFetch<Turf[]>(API_ENDPOINTS.TURFS);
  const { query, setQuery, filtered } = useSearch(turfs || [], ['name', 'location']);

  return (
    <PageLayout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <PageHeader
            title="All Available Turfs"
            subtitle="Browse through all our sports venues"
          />

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name or location..."
            className="mb-8 max-w-md"
          />

          {loading ? (
            <LoadingState message="Loading turfs..." />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <>
              <ResultCount filtered={filtered.length} total={turfs?.length || 0} itemName="venues" />
              
              {filtered.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((turf) => (
                    <TurfCard key={turf.id} {...turf} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No turfs found matching your search." />
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default AllTurfs;
