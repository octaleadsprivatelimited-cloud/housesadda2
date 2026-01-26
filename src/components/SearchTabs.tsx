import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, ChevronDown, Check } from 'lucide-react';
import { typesAPI, locationsAPI } from '@/lib/api';

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedTransaction) {
      if (selectedTransaction === 'Sale') {
        params.set('intent', 'buy');
      } else if (selectedTransaction === 'Rent') {
        params.set('intent', 'rent');
      } else {
        params.set('transactionType', selectedTransaction);
      }
    }
    
    if (selectedArea) params.set('area', selectedArea);
    if (selectedType) params.set('type', selectedType);
    if (selectedBudget) params.set('budget', selectedBudget);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Transaction Type Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/80 backdrop-blur rounded-full p-1 shadow-lg border border-gray-100">
          {transactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedTransaction(type.value)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
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
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white font-semibold py-3 px-8 rounded-lg transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] min-w-[120px] text-sm"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Popular Searches */}
      {areas.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <span className="text-xs text-gray-400 font-medium">Popular:</span>
          {areas.slice(1, 6).map((area) => (
            <button
              key={area.value}
              onClick={() => {
                setSelectedArea(area.value);
                setTimeout(handleSearch, 100);
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
