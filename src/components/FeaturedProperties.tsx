import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

export function FeaturedProperties() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll({ featured: true, active: true });
      
      const transformed: Property[] = data.slice(0, 5).map((prop: any) => ({
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
        isFeatured: true,
        isVerified: true,
        brochureUrl: prop.brochureUrl,
      }));
      
      setFeaturedProperties(transformed);
    } catch (error) {
      console.error('Error loading featured properties:', error);
      setFeaturedProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-600 text-sm font-semibold rounded-full mb-3">
              ⭐ Featured
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Popular Owner Properties</h2>
            <p className="text-gray-500 mt-2">Handpicked properties from verified owners</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/properties" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
              See all Properties <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full h-10 w-10 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full h-10 w-10 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : featuredProperties.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          >
            {featuredProperties.map((property) => (
              <div key={property.id} className="flex-shrink-0 w-[280px] md:w-[320px]">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-white/50 rounded-2xl border border-dashed border-gray-200">
            No featured properties available
          </div>
        )}
      </div>
    </section>
  );
}
