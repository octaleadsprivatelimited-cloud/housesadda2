import { Shield, Clock, Users, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Properties',
    description: 'All listings are personally verified for authenticity and legal compliance.',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get instant responses and schedule property visits at your convenience.',
  },
  {
    icon: Users,
    title: 'Expert Guidance',
    description: 'Our experienced team helps you make informed property decisions.',
  },
  {
    icon: Award,
    title: 'Best Prices',
    description: 'We negotiate the best deals to ensure maximum value for your investment.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-12 md:py-20 hero-gradient text-primary-foreground">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Why Choose Houses Adda?
          </h2>
          <p className="text-primary-foreground/80 mt-2 max-w-xl mx-auto">
            Your trusted partner for finding the perfect property in Hyderabad
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="inline-flex p-4 rounded-xl bg-accent mb-4">
                <feature.icon className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-primary-foreground/80">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-primary-foreground/20">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent">500+</div>
            <p className="text-primary-foreground/80 mt-1">Properties Listed</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent">200+</div>
            <p className="text-primary-foreground/80 mt-1">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent">50+</div>
            <p className="text-primary-foreground/80 mt-1">Localities Covered</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent">10+</div>
            <p className="text-primary-foreground/80 mt-1">Years Experience</p>
          </div>
        </div>
      </div>
    </section>
  );
}
