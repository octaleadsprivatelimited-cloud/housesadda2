import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileActionBarProps {
  propertyTitle?: string;
}

export function MobileActionBar({ propertyTitle }: MobileActionBarProps) {
  const whatsappMessage = propertyTitle
    ? `Hi Houses Adda, I'm interested in this property: ${propertyTitle}`
    : "Hi Houses Adda, I'm interested in your properties.";
  
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="mb-mobile-bar md:hidden">
      <a href="tel:+916301575658" className="flex-1">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium">
          <Phone className="h-5 w-5 mr-2" />
          Call Now
        </Button>
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button className="w-full mb-whatsapp py-3 rounded-md font-medium">
          <MessageCircle className="h-5 w-5 mr-2" />
          WhatsApp
        </Button>
      </a>
    </div>
  );
}
