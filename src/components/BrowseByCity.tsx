import { MapPin } from 'lucide-react';

const cities = [
  {
    name: 'Gachibowli',
    properties: 45,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Hitech City',
    properties: 62,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Kondapur',
    properties: 38,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Jubilee Hills',
    properties: 28,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Banjara Hills',
    properties: 22,
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Madhapur',
    properties: 55,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80',
  },
];

export function BrowseByCity() {
  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Explore</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Browse by Location
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Discover properties in Hyderabad's most sought-after localities
          </p>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <a
              key={city.name}
              href={`/properties?city=${encodeURIComponent(city.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] card-shadow card-hover"
            >
              <img
                src={city.image}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                <h3 className="font-semibold text-lg">{city.name}</h3>
                <p className="text-sm text-background/80">{city.properties} Properties</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
