import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { PropertyCard, Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Home, 
  IndianRupee,
  ChevronDown,
  Loader2
} from 'lucide-react';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get filters from URL params
  const intent = searchParams.get('intent') || '';
  const typeParam = searchParams.get('type') || '';
  const searchQuery = searchParams.get('search') || '';
  const areaParam = searchParams.get('area') || '';
  const featuredParam = searchParams.get('featured') || '';
  const budgetParam = searchParams.get('budget') || '';
  const transactionTypeParam = searchParams.get('transactionType') || '';
  
  const budgetRanges = [
    { label: 'Any Budget', min: 0, max: Infinity, value: '' },
    { label: 'Under ₹25 Lakh', min: 0, max: 2500000, value: '0-2500000' },
    { label: '₹25L - ₹50 Lakh', min: 2500000, max: 5000000, value: '2500000-5000000' },
    { label: '₹50L - ₹75 Lakh', min: 5000000, max: 7500000, value: '5000000-7500000' },
    { label: '₹75L - ₹1 Crore', min: 7500000, max: 10000000, value: '7500000-10000000' },
    { label: '₹1Cr - ₹2 Crore', min: 10000000, max: 20000000, value: '10000000-20000000' },
    { label: '₹2Cr - ₹5 Crore', min: 20000000, max: 50000000, value: '20000000-50000000' },
    { label: 'Above ₹5 Crore', min: 50000000, max: Infinity, value: '50000000-' },
  ];

  // Find initial budget from URL param
  const getInitialBudget = () => {
    if (budgetParam) {
      const found = budgetRanges.find(b => b.value === budgetParam);
      if (found) return found;
    }
    return budgetRanges[0];
  };
  
  const [selectedArea, setSelectedArea] = useState(areaParam || 'All Areas');
  const [selectedType, setSelectedType] = useState(typeParam || 'All Types');
  const [selectedBudget, setSelectedBudget] = useState(getInitialBudget());

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, typeParam, areaParam, searchQuery, featuredParam, transactionTypeParam, budgetParam]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const params: any = { active: true };
      
      // Map intent to transaction type
      if (intent === 'buy') {
        params.transactionType = 'Sale';
      } else if (intent === 'rent') {
        params.transactionType = 'Rent';
      } else if (intent === 'pg') {
        params.transactionType = 'PG';
      } else if (transactionTypeParam) {
        params.transactionType = transactionTypeParam;
      }
      
      // Add type filter
      if (typeParam) {
        params.type = typeParam;
      }
      
      // Add area filter (location)
      if (areaParam) {
        params.area = areaParam;
      }
      
      // Add search query if present (for title/description search)
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Add featured filter if present
      if (featuredParam === 'true') {
        params.featured = true;
      }
      
      console.log('🔍 Loading properties with params:', params);
      const data = await propertiesAPI.getAll(params);
      
      // Transform API data to Property format
      const transformedProperties: Property[] = data.map((prop: any) => ({
        id: String(prop.id),
        title: prop.title,
        type: prop.type || 'Apartment',
        city: prop.city || 'Hyderabad',
        area: prop.area || '',
        price: prop.price,
        priceUnit: 'onwards',
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        image: prop.image || prop.images?.[0] || '',
        imageCount: prop.images?.length || 0,
        isFeatured: prop.isFeatured,
        isVerified: true,
        brochureUrl: prop.brochureUrl,
      }));
      
      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [areas, setAreas] = useState<string[]>(['All Areas']);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['All Types']);

  useEffect(() => {
    loadLocationsAndTypes();
  }, []);

  const loadLocationsAndTypes = async () => {
    try {
      const [locationsData, typesData] = await Promise.all([
        propertiesAPI.getAll({ active: true }).then(props => {
          const uniqueAreas = new Set<string>(['All Areas']);
          props.forEach((p: any) => {
            if (p.area) uniqueAreas.add(p.area);
          });
          return Array.from(uniqueAreas);
        }),
        import('@/lib/api').then(m => m.typesAPI.getAll()).then(types => {
          return ['All Types', ...types.map((t: any) => t.name)];
        })
      ]);
      
      setAreas(locationsData);
      setPropertyTypes(typesData);
    } catch (error) {
      console.error('Error loading locations/types:', error);
    }
  };

  // Sync state with URL params
  useEffect(() => {
    if (areaParam) setSelectedArea(areaParam);
    else setSelectedArea('All Areas');
  }, [areaParam]);

  useEffect(() => {
    if (typeParam) setSelectedType(typeParam);
    else setSelectedType('All Types');
  }, [typeParam]);

  // Filter properties (only apply budget filter locally, rest is handled by API)
  const filteredProperties = properties.filter((property) => {
    // Budget filter (local only since API doesn't support it yet)
    const budgetMatch = property.price >= selectedBudget.min && property.price <= selectedBudget.max;
    
    // Local area filter (in case of additional filtering from dropdown)
    const areaMatch = selectedArea === 'All Areas' || !areaParam || property.area === selectedArea;
    
    // Local type filter
    const typeMatch = selectedType === 'All Types' || !typeParam || property.type === selectedType;
    
    // Local search filter for title/description
    let searchMatch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        property.title.toLowerCase().includes(query) ||
        property.area?.toLowerCase().includes(query) ||
        property.city?.toLowerCase().includes(query) ||
        property.type?.toLowerCase().includes(query);
    }
    
    return budgetMatch && areaMatch && typeMatch && searchMatch;
  });

  const clearFilters = () => {
    setSelectedArea('All Areas');
    setSelectedType('All Types');
    setSelectedBudget(budgetRanges[0]);
  };

  const hasActiveFilters = selectedArea !== 'All Areas' || selectedType !== 'All Types' || selectedBudget.label !== 'Any Budget';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Page Header with Background Image */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')`,
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {searchQuery ? `Search: "${searchQuery}"` : 
                 areaParam ? `Properties in ${areaParam}` :
                 featuredParam === 'true' ? 'Featured Properties' : 'All Properties'}
              </h1>
              <p className="text-lg text-white/80">
                {filteredProperties.length} properties found
                {intent === 'buy' && ' for Sale'}
                {intent === 'rent' && ' for Rent'}
                {featuredParam === 'true' && ' (Featured)'}
                {typeParam && ` - ${typeParam}`}
                {areaParam && !searchQuery && ` in ${areaParam}`}
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-6 md:py-10">
          <div className="container">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-3">
                {/* Area Filter */}
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <Home className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Budget Filter */}
                <div className="relative">
                  <select
                    value={selectedBudget.label}
                    onChange={(e) => setSelectedBudget(budgetRanges.find(b => b.label === e.target.value) || budgetRanges[0])}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {budgetRanges.map((budget) => (
                      <option key={budget.label} value={budget.label}>{budget.label}</option>
                    ))}
                  </select>
                  <IndianRupee className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </Button>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : ''}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </p>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading properties...</span>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                : 'flex flex-col gap-4'
              }>
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Mobile Filter Sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 animate-slide-in max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Area */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Location</label>
                  <div className="relative">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Property Type</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Budget Range</label>
                  <div className="relative">
                    <select
                      value={selectedBudget.label}
                      onChange={(e) => setSelectedBudget(budgetRanges.find(b => b.label === e.target.value) || budgetRanges[0])}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {budgetRanges.map((budget) => (
                        <option key={budget.label} value={budget.label}>{budget.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1 py-6" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1 py-6 accent-gradient" onClick={() => setShowFilters(false)}>
                  Show {filteredProperties.length} Properties
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </div>
  );
};

export default Properties;
