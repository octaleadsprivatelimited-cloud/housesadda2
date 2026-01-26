import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { locationsAPI, propertiesAPI } from '@/lib/api';

interface Locality {
  name: string;
  count: number;
}

export function BrowseByLocality() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocalities();
  }, []);

  const loadLocalities = async () => {
    try {
      setIsLoading(true);
      // Fetch locations and properties count
      const [locations, properties] = await Promise.all([
        locationsAPI.getAll(),
        propertiesAPI.getAll({ active: true })
      ]);

      // Count properties by area
      const areaCounts: Record<string, number> = {};
      properties.forEach((p: any) => {
        const area = p.area || '';
        if (area) {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
      });

      // Map locations with counts
      const mappedLocalities = locations.map((l: any) => ({
        name: l.name,
        count: areaCounts[l.name] || 0,
      }));

      // Sort by count (most properties first), then by name
      // Show all locations, not just top 10, so admin-added locations are visible
      mappedLocalities.sort((a: Locality, b: Locality) => {
        if (b.count !== a.count) {
          return b.count - a.count; // Sort by count first
        }
        return a.name.localeCompare(b.name); // Then alphabetically
      });
      
      // Show up to 15 locations to ensure visibility
      setLocalities(mappedLocalities.slice(0, 15));
    } catch (error) {
      console.error('Error loading localities:', error);
      setLocalities([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-secondary/30">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Show section even if no properties yet, to display locations added by admin
  if (localities.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center py-12">
            <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 text-sm font-semibold rounded-full mb-3">
              📍 Locations
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Top Localities</h2>
            <p className="text-gray-500">Locations will appear here once properties are added</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 text-sm font-semibold rounded-full mb-3">
              📍 Locations
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Top Localities in Hyderabad</h2>
            <p className="text-gray-500 mt-2">Explore properties in popular neighborhoods</p>
          </div>
          <Link to="/properties" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors w-fit">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {localities.map((locality, index) => (
            <Link
              key={locality.name}
              to={`/properties?area=${encodeURIComponent(locality.name)}`}
              className="group bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Rank Badge */}
              {index < 3 && (
                <span className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                }`}>
                  {index + 1}
                </span>
              )}
              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-lg">
                {locality.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">{locality.count} Properties</p>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full transition-all duration-500 group-hover:w-full"
                  style={{ width: `${Math.min((locality.count / 10) * 100, 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
