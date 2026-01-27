import { lazy, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for faster initial load
const FeaturedPropertiesTabs = lazy(() => import('@/components/FeaturedPropertiesTabs').then(m => ({ default: m.FeaturedPropertiesTabs })));
const CategoryCards = lazy(() => import('@/components/CategoryCards').then(m => ({ default: m.CategoryCards })));
const FeaturedProperties = lazy(() => import('@/components/FeaturedProperties').then(m => ({ default: m.FeaturedProperties })));
const BrowseByLocality = lazy(() => import('@/components/BrowseByLocality').then(m => ({ default: m.BrowseByLocality })));
const LatestProperties = lazy(() => import('@/components/LatestProperties').then(m => ({ default: m.LatestProperties })));
const WhatsAppButton = lazy(() => import('@/components/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })));
const MobileActionBar = lazy(() => import('@/components/MobileActionBar').then(m => ({ default: m.MobileActionBar })));

// Loading skeleton component
const SectionSkeleton = () => (
  <div className="py-12 md:py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg aspect-[4/3] animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <HeroSection />
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedPropertiesTabs />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CategoryCards />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedProperties />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <BrowseByLocality />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <LatestProperties />
        </Suspense>
      </main>

      <Footer />
      
      <Suspense fallback={null}>
        <WhatsAppButton />
      </Suspense>
      
      <Suspense fallback={null}>
        <MobileActionBar />
      </Suspense>
    </div>
  );
};

export default Index;
