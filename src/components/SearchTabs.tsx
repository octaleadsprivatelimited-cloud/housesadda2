import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, ChevronDown, Check, Loader2 } from 'lucide-react';
import { typesAPI, locationsAPI, propertiesAPI } from '@/lib/api';

const budgetRanges = [
  { label: 'Any Budget', value: '' },
  { label: 'Under 25L', value: '0-2500000' },
  { label: '25L - 50L', value: '2500000-5000000' },
  { label: '50L - 75L', value: '5000000-7500000' },
  { label: '75L - 1Cr', value: '7500000-10000000' },
  { label: '1Cr - 2Cr', value: '10000000-20000000' },
  { label: '2Cr - 5Cr', value: '20000000-50000000' },
  { label: '5Cr+', value: '50000000-' },
];

const transactionTypes = [
  { label: 'Buy', value: 'Sale' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Lease', value: 'Lease' },
  { label: 'PG', value: 'PG' },
];

// Custom Dropdown Component
interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDropdown({ label, icon, value, options, onChange, placeholder = 'Select' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
          isOpen 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-100 hover:border-gray-200 bg-white'
        }`}
      >
        <span className={`${isOpen ? 'text-primary' : 'text-gray-400'}`}>{icon}</span>
        <div className="flex-1 text-left">
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
          <p className={`text-xs font-medium truncate ${selectedOption?.label ? 'text-gray-800' : 'text-gray-400'}`}>
            {selectedOption?.label || placeholder}
          </p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-primary/5 text-primary' : 'text-gray-700'
              }`}
            >
              <span className="text-xs font-medium">{option.label}</span>
              {value === option.value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchTabs() {
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState<{ label: string; value: string }[]>([]);
  const [areas, setAreas] = useState<{ label: string; value: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('Sale');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const types = await typesAPI.getAll();
      const typeOptions = [
        { label: 'All Types', value: '' },
        ...types.map((t: any) => ({ label: t.name, value: t.name }))
      ];
      setPropertyTypes(typeOptions);
      
      const locations = await locationsAPI.getAll();
      const areaOptions = [
        { label: 'All Areas', value: '' },
        ...locations.map((l: any) => ({ label: l.name, value: l.name }))
      ];
      setAreas(areaOptions);
    } catch (error) {
      console.error('Error loading data:', error);
      setPropertyTypes([
        { label: 'All Types', value: '' },
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Plot', value: 'Plot' },
      ]);
      setAreas([
        { label: 'All Areas', value: '' },
        { label: 'Gachibowli', value: 'Gachibowli' },
        { label: 'Hitech City', value: 'Hitech City' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setShowResults(false);
    
    try {
      // Build search parameters
      const searchParams: any = {
        active: true,
        limit: 20,
        skipImages: false
      };

      // Add transaction type
      if (selectedTransaction) {
        searchParams.transactionType = selectedTransaction;
      }

      // Add area filter
      if (selectedArea) {
        searchParams.area = selectedArea;
      }

      // Add type filter
      if (selectedType) {
        searchParams.type = selectedType;
      }

      // Add budget filter
      if (selectedBudget) {
        searchParams.budget = selectedBudget;
      }

      // Call search API
      const response = await propertiesAPI.search(searchParams);
      
      // Handle response
      const results = response.properties || response || [];
      setSearchResults(results);
      setShowResults(true);

      // Also navigate to properties page with filters for full view
      const urlParams = new URLSearchParams();
      if (selectedTransaction) {
        if (selectedTransaction === 'Sale') {
          urlParams.set('intent', 'buy');
        } else if (selectedTransaction === 'Rent') {
          urlParams.set('intent', 'rent');
        } else {
          urlParams.set('transactionType', selectedTransaction);
        }
      }
      if (selectedArea) urlParams.set('area', selectedArea);
      if (selectedType) urlParams.set('type', selectedType);
      if (selectedBudget) urlParams.set('budget', selectedBudget);

      // Navigate after a short delay to show results
      setTimeout(() => {
        navigate(`/properties?${urlParams.toString()}`);
      }, 500);
    } catch (error: any) {
      console.error('Search error:', error);
      // Still navigate to properties page even if search fails
      const urlParams = new URLSearchParams();
      if (selectedTransaction) {
        if (selectedTransaction === 'Sale') {
          urlParams.set('intent', 'buy');
        } else if (selectedTransaction === 'Rent') {
          urlParams.set('intent', 'rent');
        } else {
          urlParams.set('transactionType', selectedTransaction);
        }
      }
      if (selectedArea) urlParams.set('area', selectedArea);
      if (selectedType) urlParams.set('type', selectedType);
      if (selectedBudget) urlParams.set('budget', selectedBudget);
      navigate(`/properties?${urlParams.toString()}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Transaction Type Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/80 backdrop-blur rounded-full p-1 shadow-lg border border-gray-100">
          {transactionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedTransaction(type.value)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedTransaction === type.value
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-2xl shadow-gray-200/50 p-3 md:p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Area Dropdown */}
          <CustomDropdown
            label="Location"
            icon={<MapPin className="h-4 w-4" />}
            value={selectedArea}
            options={areas}
            onChange={setSelectedArea}
            placeholder="Select Area"
          />

          {/* Property Type Dropdown */}
          <CustomDropdown
            label="Property Type"
            icon={<Home className="h-4 w-4" />}
            value={selectedType}
            options={propertyTypes}
            onChange={setSelectedType}
            placeholder="Select Type"
          />

          {/* Budget Dropdown */}
          <CustomDropdown
            label="Budget"
            icon={<IndianRupee className="h-4 w-4" />}
            value={selectedBudget}
            options={budgetRanges}
            onChange={setSelectedBudget}
            placeholder="Any Budget"
          />

          {/* Search Button */}
          <button 
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] min-w-[120px] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Results Preview */}
      {showResults && searchResults.length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
            </h3>
            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {searchResults.slice(0, 5).map((property: any) => (
              <a
                key={property.id}
                href={`/property/${property.id}`}
                className="block p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {property.image && (
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{property.title}</p>
                    <p className="text-xs text-gray-500">
                      {property.area}, {property.city}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-1">
                      {property.price >= 10000000
                        ? `₹${(property.price / 10000000).toFixed(2)} Cr`
                        : property.price >= 100000
                        ? `₹${(property.price / 100000).toFixed(1)} Lac`
                        : `₹${property.price.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {searchResults.length > 5 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              +{searchResults.length - 5} more properties. Click search to view all.
            </p>
          )}
        </div>
      )}

      {/* Popular Searches */}
      {areas.length > 1 && !showResults && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <span className="text-xs text-gray-400 font-medium">Popular:</span>
          {areas.slice(1, 6).map((area) => (
            <button
              key={area.value}
              type="button"
              onClick={() => {
                setSelectedArea(area.value);
                setTimeout(() => {
                  handleSearch();
                }, 100);
              }}
              className="px-3 py-1 text-xs text-gray-500 hover:text-white hover:bg-primary bg-white/80 backdrop-blur border border-gray-200 hover:border-primary rounded-full transition-all shadow-sm"
            >
              {area.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
