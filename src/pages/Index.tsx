import { lazy, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for faster initial load with error handling
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Failed to load component:', error);
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        return await componentImport();
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw retryError;
      }
    }
  });
};

const FeaturedPropertiesTabs = lazyWithRetry(() => import('@/components/FeaturedPropertiesTabs').then(m => ({ default: m.FeaturedPropertiesTabs })));
const CategoryCards = lazyWithRetry(() => import('@/components/CategoryCards').then(m => ({ default: m.CategoryCards })));
const FeaturedProperties = lazyWithRetry(() => import('@/components/FeaturedProperties').then(m => ({ default: m.FeaturedProperties })));
const BrowseByLocality = lazyWithRetry(() => import('@/components/BrowseByLocality').then(m => ({ default: m.BrowseByLocality })));
const LatestProperties = lazyWithRetry(() => import('@/components/LatestProperties').then(m => ({ default: m.LatestProperties })));
const WhatsAppButton = lazyWithRetry(() => import('@/components/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })));
const MobileActionBar = lazyWithRetry(() => import('@/components/MobileActionBar').then(m => ({ default: m.MobileActionBar })));

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
