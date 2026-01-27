import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Image as ImageIcon, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  area: string;
  price: number;
  priceUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  image: string;
  imageCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  brochureUrl?: string;
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = memo(function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const whatsappMessage = `Hi Houses Adda, I'm interested in: ${property.title} in ${property.area}`;
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image */}
      <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={property.image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80'}
          alt={property.title}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80') {
              target.src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80';
            }
          }}
        />
        
        {/* Featured Badge */}
        {property.isFeatured && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-md shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Featured
          </span>
        )}
        
        {/* Image Count */}
        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-md backdrop-blur-sm flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          {property.imageCount || 5}
        </span>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Property Type & Verified */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            {property.bedrooms ? `${property.bedrooms} BHK` : ''} {property.type}
          </span>
          {property.isVerified && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-md flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {/* Price */}
        <div>
          <span className="text-lg sm:text-xl font-bold text-primary">{formatPrice(property.price)}</span>
          {property.sqft && (
            <span className="text-xs sm:text-sm text-gray-500 ml-2">| {property.sqft.toLocaleString()} sqft</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{property.area}, {property.city}</span>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {property.title}
          </h3>
        </Link>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a href="tel:+916301575658" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm h-9 sm:h-10">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Contact</span>
              <span className="sm:hidden">Call</span>
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm h-9 sm:h-10">
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
});
