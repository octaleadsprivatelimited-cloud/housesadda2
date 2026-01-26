import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, Building2, Home, Store, Trees, Warehouse, MapPin } from 'lucide-react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

const categories = [
  { id: 'all', label: 'All Properties', filter: null, icon: Building2, color: 'from-blue-500 to-blue-600' },
  { id: 'apartment', label: 'Apartments', filter: 'Apartment', icon: Building2, color: 'from-purple-500 to-purple-600' },
  { id: 'flat', label: 'Flats', filter: 'Flat', icon: Home, color: 'from-teal-500 to-teal-600' },
  { id: 'villa', label: 'Villas', filter: 'Villa', icon: Home, color: 'from-amber-500 to-amber-600' },
  { id: 'plot', label: 'Plots', filter: 'Plot', icon: MapPin, color: 'from-green-500 to-green-600' },
  { id: 'commercial', label: 'Commercial', filter: 'Commercial', icon: Store, color: 'from-red-500 to-red-600' },
  { id: 'farmhouse', label: 'Farm Houses', filter: 'Farm House', icon: Warehouse, color: 'from-orange-500 to-orange-600' },
  { id: 'farmland', label: 'Farm Lands', filter: 'Farm Land', icon: Trees, color: 'from-emerald-500 to-emerald-600' },
];

interface CategorySectionProps {
  category: typeof categories[0];
  allProperties: Property[];
}

function CategorySection({ category, allProperties }: CategorySectionProps) {
  const Icon = category.icon;
  
  // Filter properties for this category
  const filteredProperties = category.filter 
    ? allProperties.filter(p => 
        p.type?.toLowerCase() === category.filter?.toLowerCase() ||
        p.title?.toLowerCase().includes(category.filter?.toLowerCase() || '')
      )
    : allProperties;

  const displayProperties = filteredProperties.slice(0, 4);

  if (displayProperties.length === 0) {
    return null; // Don't show section if no properties
  }

  const getFilterLink = () => {
    if (category.filter) {
      return `/properties?type=${encodeURIComponent(category.filter)}`;
    }
    return '/properties';
  };

  return (
    <div className="mb-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg shadow-${category.color.split('-')[1]}-500/20`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{category.label}</h3>
            <p className="text-sm text-gray-500">{filteredProperties.length} properties available</p>
          </div>
        </div>
        <Link 
          to={getFilterLink()} 
          className="text-primary text-sm font-semibold flex items-center gap-1 bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedPropertiesTabs() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllProperties();
  }, []);

  const loadAllProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll({ active: true });
      
      const transformed: Property[] = data.map((prop: any) => ({
        id: String(prop.id),
        title: prop.title,
        type: prop.type || 'Apartment',
        city: prop.city || 'Hyderabad',
        area: prop.area || '',
        price: prop.price,
        priceUnit: 'onwards',
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        image: prop.image || prop.images?.[0] || '',
        imageCount: prop.images?.length || 0,
        isFeatured: prop.isFeatured,
        isVerified: true,
        brochureUrl: prop.brochureUrl,
      }));
      
      setAllProperties(transformed);
    } catch (error) {
      console.error('Error loading properties:', error);
      setAllProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading properties...</span>
          </div>
        </div>
      </section>
    );
  }

  if (allProperties.length === 0) {
    return (
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="container">
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Available</h3>
            <p className="text-gray-500">Check back later for new listings</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container relative z-10">
        {/* Main Title */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Browse Categories
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Properties by Category
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Find your perfect property from our wide range of listings</p>
        </div>

        {/* Category Sections */}
        {categories.map((category) => (
          <CategorySection 
            key={category.id} 
            category={category} 
            allProperties={allProperties} 
          />
        ))}
      </div>
    </section>
  );
}
