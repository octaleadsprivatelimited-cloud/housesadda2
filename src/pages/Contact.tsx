import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
              backgroundImage: `url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80')`,
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Phone className="h-4 w-4 text-white" />
              <span className="text-white/90 text-sm font-medium">24/7 Support Available</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Get In Touch</h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
              Have questions about a property? Want to schedule a visit? We're here to help you find your dream home.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-20">
              <a href="tel:+916301575658" className="bg-card rounded-2xl p-6 card-shadow card-hover text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-muted-foreground">+91 63015 75658</p>
              </a>
              
              <a href="mailto:info@housesadda.in" className="bg-card rounded-2xl p-6 card-shadow card-hover text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-sm text-muted-foreground">info@housesadda.in</p>
              </a>
              
              <div className="bg-card rounded-2xl p-6 card-shadow text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Visit Us</h3>
                <p className="text-sm text-muted-foreground">Hyderabad, Telangana</p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 card-shadow text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Working Hours</h3>
                <p className="text-sm text-muted-foreground">Mon - Sat: 9AM - 7PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-8 md:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground mb-6">
                  Fill out the form below and we'll get back to you shortly.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Property Inquiry"
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about the property you're looking for..."
                      rows={5}
                      required
                      className="rounded-xl resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 accent-gradient text-accent-foreground py-6 rounded-xl font-semibold"
                      disabled={isSubmitting}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                    <a
                      href={`https://wa.me/916301575658?text=${encodeURIComponent("Hi Houses Adda, I'd like to inquire about properties.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="button" className="whatsapp-btn py-6 rounded-xl">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </a>
                  </div>
                </form>
              </div>

              {/* Map */}
              <div className="space-y-6">
                <div className="bg-card rounded-2xl overflow-hidden card-shadow h-[400px] lg:h-full min-h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3169899878!2d78.24323194687498!3d17.41249865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1704067200000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen
                    loading="eager"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Houses Adda Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-secondary/50">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Prefer a Quick Call?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our property experts are available to assist you. Call us directly for immediate assistance.
            </p>
            <a href="tel:+916301575658">
              <Button className="hero-gradient px-8 py-6 text-base font-semibold rounded-xl">
                <Phone className="h-5 w-5 mr-2" />
                Call +91 63015 75658
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </div>
  );
};

export default Contact;
