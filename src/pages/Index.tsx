import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedPropertiesTabs } from '@/components/FeaturedPropertiesTabs';
import { CategoryCards } from '@/components/CategoryCards';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { LatestProperties } from '@/components/LatestProperties';
import { BrowseByLocality } from '@/components/BrowseByLocality';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <HeroSection />
        <FeaturedPropertiesTabs />
        <CategoryCards />
        <FeaturedProperties />
        <BrowseByLocality />
        <LatestProperties />
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </div>
  );
};

export default Index;
