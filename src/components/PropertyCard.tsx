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
    <div className="mb-property-card group">
      {/* Image */}
      <Link to={`/property/${property.id}`} className="block mb-property-image aspect-[4/3]">
        <img
          src={property.image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80'}
          alt={property.title}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80') {
              target.src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80';
            }
          }}
        />
        
        {/* Featured Badge */}
        {property.isFeatured && (
          <span className="mb-badge-featured">Featured</span>
        )}
        
        {/* Image Count */}
        <span className="mb-image-count">
          <ImageIcon className="h-3 w-3" />
          {property.imageCount || 5}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Property Type & Verified */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {property.bedrooms ? `${property.bedrooms} BHK` : ''} {property.type}
          </span>
          {property.isVerified && (
            <span className="mb-badge-verified">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {/* Price */}
        <div>
          <span className="mb-price">{formatPrice(property.price)}</span>
          {property.sqft && (
            <span className="mb-price-unit">| {property.sqft.toLocaleString()} sqft</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{property.area}, {property.city}</span>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a href="tel:+916301575658" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Phone className="h-3.5 w-3.5 mr-1" />
              Contact
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full mb-whatsapp text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
});
