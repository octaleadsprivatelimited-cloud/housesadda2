import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { Building2, Target, Eye, Users, Award, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const teamMembers = [
  {
    name: 'Sreekanth',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
    description: 'With over 10 years in real estate, Sreekanth leads Houses Adda with vision and expertise.',
  },
  {
    name: 'Priya Sharma',
    role: 'Senior Property Consultant',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
    description: 'Expert in luxury properties and villas across Jubilee Hills and Banjara Hills.',
  },
  {
    name: 'Rahul Reddy',
    role: 'Commercial Properties Head',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
    description: 'Specializes in commercial spaces and investment properties in IT corridor.',
  },
];

const values = [
  {
    icon: CheckCircle2,
    title: 'Transparency',
    description: 'We believe in complete transparency in all our dealings. No hidden charges, no surprises.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We go the extra mile to find your perfect property.',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Every property we list is personally verified for legal compliance and quality.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section with Background Image */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')`,
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Building2 className="h-4 w-4 text-white" />
                <span className="text-white/90 text-sm font-medium">Established 2014</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">About Houses Adda</h1>
              <p className="text-xl md:text-2xl text-white/80">
                Your trusted partner in finding the perfect property in Hyderabad since 2014.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 md:py-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <div className="flex items-center gap-2 text-accent mb-4">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Our Story</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-6">
                  Building Dreams, One Property at a Time
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2014 by <strong className="text-foreground">Sreekanth</strong>, Houses Adda began with a simple mission: to make property buying a seamless and trustworthy experience for everyone in Hyderabad.
                  </p>
                  <p>
                    What started as a small property consulting firm has now grown into one of Hyderabad's most trusted real estate platforms, helping hundreds of families find their dream homes across the city's most sought-after localities.
                  </p>
                  <p>
                    Today, we specialize in apartments, villas, plots, and commercial properties across Gachibowli, Hitech City, Kondapur, Jubilee Hills, Banjara Hills, and many other prime locations.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80"
                  alt="Luxury Property"
                  className="rounded-2xl card-shadow"
                />
                <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-2xl card-shadow">
                  <div className="text-4xl font-bold">10+</div>
                  <div className="text-sm">Years of Trust</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 md:py-20 bg-secondary/50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-card rounded-2xl p-8 card-shadow">
                <div className="inline-flex p-4 rounded-xl hero-gradient mb-4">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To simplify the property buying journey by providing verified listings, transparent dealings, and expert guidance. We aim to be the most trusted name in Hyderabad's real estate market.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 card-shadow">
                <div className="inline-flex p-4 rounded-xl accent-gradient mb-4">
                  <Eye className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become Hyderabad's leading property platform, where every buyer finds their perfect home and every seller gets the best value for their property.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do at Houses Adda
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => (
                <div key={value.title} className="text-center p-6">
                  <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-20 bg-secondary/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experienced professionals dedicated to helping you find your perfect property
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-card rounded-2xl overflow-hidden card-shadow card-hover">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-accent font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 md:py-20 hero-gradient text-primary-foreground">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent">500+</div>
                <p className="text-primary-foreground/80 mt-2">Properties Listed</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent">200+</div>
                <p className="text-primary-foreground/80 mt-2">Happy Families</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent">50+</div>
                <p className="text-primary-foreground/80 mt-2">Localities</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent">₹500Cr+</div>
                <p className="text-primary-foreground/80 mt-2">Property Value</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Let our experts help you discover the perfect property that matches your needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+916301575658">
                <Button className="accent-gradient px-8 py-6 text-base font-semibold rounded-xl">
                  <Phone className="h-5 w-5 mr-2" />
                  Call +91 63015 75658
                </Button>
              </a>
              <a href="/properties">
                <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                  Browse Properties
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </div>
  );
};

export default About;
