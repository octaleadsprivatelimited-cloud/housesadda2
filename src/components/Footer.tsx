import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="bg-white rounded px-2 py-1 inline-block mb-4">
              <span className="text-primary font-bold text-lg">Houses</span>
              <span className="text-foreground font-bold text-lg">Adda</span>
            </div>
            <p className="text-background/70 text-sm mb-4">
              Your trusted property consultant in Hyderabad.
            </p>
            <div className="flex gap-2">
              <a href="#" className="p-2 rounded bg-background/10 hover:bg-background/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-background/10 hover:bg-background/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-background/10 hover:bg-background/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-background/10 hover:bg-background/20 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-background/70 hover:text-primary">Home</Link></li>
              <li><Link to="/properties" className="text-background/70 hover:text-primary">Properties</Link></li>
              <li><Link to="/about" className="text-background/70 hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="text-background/70 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties?type=apartment" className="text-background/70 hover:text-primary">Apartments</Link></li>
              <li><Link to="/properties?type=villa" className="text-background/70 hover:text-primary">Villas</Link></li>
              <li><Link to="/properties?type=plot" className="text-background/70 hover:text-primary">Plots</Link></li>
              <li><Link to="/properties?type=commercial" className="text-background/70 hover:text-primary">Commercial</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+916301575658" className="flex items-center gap-2 text-background/70 hover:text-primary">
                  <Phone className="h-4 w-4" />
                  +91 63015 75658
                </a>
              </li>
              <li>
                <a href="mailto:info@housesadda.in" className="flex items-center gap-2 text-background/70 hover:text-primary">
                  <Mail className="h-4 w-4" />
                  info@housesadda.in
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-background/70">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  Hyderabad, Telangana
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-background/60">
          <p>© {new Date().getFullYear()} Houses Adda. All rights reserved.</p>
          <p>Developed by <span className="text-primary font-medium">OctaLeads Pvt Ltd</span></p>
        </div>
      </div>
    </footer>
  );
}
