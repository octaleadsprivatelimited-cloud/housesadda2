import { useState, useEffect } from 'react';
import { Building2, Home, Map, Store, Loader2, Trees, Wheat, Users, Building } from 'lucide-react';
import { typesAPI, propertiesAPI } from '@/lib/api';

// Icon and color mapping for property types
const typeStyles: Record<string, { icon: any; color: string; description: string }> = {
  'Apartment': { icon: Building2, color: 'from-blue-500 to-blue-600', description: '1, 2, 3, 4 BHK Flats' },
  'Apartments': { icon: Building2, color: 'from-blue-500 to-blue-600', description: '1, 2, 3, 4 BHK Flats' },
  'Flat': { icon: Building, color: 'from-indigo-500 to-indigo-600', description: '1, 2, 3, 4 BHK Flats' },
  'Flats': { icon: Building, color: 'from-indigo-500 to-indigo-600', description: '1, 2, 3, 4 BHK Flats' },
  'Villa': { icon: Home, color: 'from-emerald-500 to-emerald-600', description: 'Independent Houses' },
  'Villas': { icon: Home, color: 'from-emerald-500 to-emerald-600', description: 'Independent Houses' },
  'Plot': { icon: Map, color: 'from-amber-500 to-amber-600', description: 'HMDA Approved Lands' },
  'Plots': { icon: Map, color: 'from-amber-500 to-amber-600', description: 'HMDA Approved Lands' },
  'Commercial': { icon: Store, color: 'from-purple-500 to-purple-600', description: 'Office & Retail Spaces' },
  'Farm House': { icon: Trees, color: 'from-green-500 to-green-600', description: 'Farm Houses & Retreats' },
  'Farm Land': { icon: Wheat, color: 'from-lime-500 to-lime-600', description: 'Agricultural Lands' },
  'PG': { icon: Users, color: 'from-pink-500 to-pink-600', description: 'Paying Guest Accommodations' },
  'default': { icon: Building2, color: 'from-gray-500 to-gray-600', description: 'Properties' },
};

interface PropertyType {
  name: string;
  count: number;
  icon: any;
  color: string;
  description: string;
}

export function BrowseByType() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  const loadPropertyTypes = async () => {
    try {
      setIsLoading(true);
      // Fetch types and properties count
      const [types, properties] = await Promise.all([
        typesAPI.getAll(),
        propertiesAPI.getAll({ active: true })
      ]);

      // Count properties by type
      const typeCounts: Record<string, number> = {};
      properties.forEach((p: any) => {
        const type = p.type || 'Other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Map types with counts and styles
      // Show all types added by admin, even if they have 0 properties
      const mappedTypes = types.map((t: any) => {
        const style = typeStyles[t.name] || typeStyles['default'];
        return {
          name: t.name,
          count: typeCounts[t.name] || 0,
          icon: style.icon,
          color: style.color,
          description: style.description,
        };
      });

      // Sort by count (most properties first), then alphabetically
      mappedTypes.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name);
      });

      setPropertyTypes(mappedTypes);
    } catch (error) {
      console.error('Error loading property types:', error);
      // Fallback
      setPropertyTypes([
        { name: 'Apartment', count: 0, icon: Building2, color: 'from-blue-500 to-blue-600', description: 'Flats' },
        { name: 'Villa', count: 0, icon: Home, color: 'from-emerald-500 to-emerald-600', description: 'Houses' },
        { name: 'Plot', count: 0, icon: Map, color: 'from-amber-500 to-amber-600', description: 'Lands' },
        { name: 'Commercial', count: 0, icon: Store, color: 'from-purple-500 to-purple-600', description: 'Offices' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-20">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            What are you looking for?
          </h2>
          <p className="text-muted-foreground mt-2">
            Browse properties by type to find your perfect match
          </p>
        </div>

        {/* Type Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {propertyTypes.map((type) => (
            <a
              key={type.name}
              href={`/properties?type=${encodeURIComponent(type.name.toLowerCase())}`}
              className="group bg-card rounded-2xl p-6 md:p-8 card-shadow card-hover text-center"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${type.color} mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                {type.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
              <span className="text-sm font-medium text-primary">{type.count} Properties</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
