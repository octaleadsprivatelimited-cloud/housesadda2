import { useEffect, useState } from 'react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

export function LatestProperties() {
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestProperties();
  }, []);

  const loadLatestProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll({ active: true });
      
      // Sort by created date and take latest 6
      const sorted = data.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      const transformed: Property[] = sorted.slice(0, 6).map((prop: any) => ({
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
      
      setLatestProperties(transformed);
    } catch (error) {
      console.error('Error loading latest properties:', error);
      setLatestProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8f8f8_1px,transparent_1px),linear-gradient(to_bottom,#f8f8f8_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-600 text-sm font-semibold rounded-full mb-3">
              🆕 New Listings
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Latest Properties</h2>
            <p className="text-gray-500 mt-2">Fresh listings added recently</p>
          </div>
          <Link to="/properties" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors w-fit">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : latestProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {latestProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No properties available
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/properties">
            <Button className="bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
              View All Properties <ArrowRight className="ml-2 h-4 w-4 inline" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
