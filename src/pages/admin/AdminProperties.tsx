import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  Building2,
  MapPin,
  Loader2,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { propertiesAPI } from '@/lib/api';

const AdminProperties = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('filter') || 'all');

  useEffect(() => {
    loadProperties();
  }, [transactionFilter]);

  // Memoize filtered properties to avoid unnecessary re-renders
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.area?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter === 'featured') {
      filtered = filtered.filter(p => p.is_featured);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.is_active);
    }

    return filtered;
  }, [properties, searchQuery, statusFilter]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (transactionFilter !== 'All') {
        params.transactionType = transactionFilter;
      }
      const data = await propertiesAPI.getAll(params);
      setProperties(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      await propertiesAPI.toggleFeatured(id, !currentValue);
      await loadProperties();
      toast({ title: "Updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      await propertiesAPI.toggleActive(id, !currentValue);
      await loadProperties();
      toast({ title: "Updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    try {
      await propertiesAPI.delete(id);
      await loadProperties();
      toast({ title: "Deleted", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
          <p className="text-gray-500 text-sm">{filteredProperties.length} listings</p>
        </div>
        <Link to="/admin/properties/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              e.target.value === 'all' ? setSearchParams({}) : setSearchParams({ filter: e.target.value });
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
          
          <select
            value={transactionFilter}
            onChange={(e) => setTransactionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="All">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
            <option value="Lease">Lease</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      {filteredProperties.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Type</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Featured</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property, idx) => (
                  <tr 
                    key={property.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {property.image ? (
                            <img src={property.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">{property.title}</p>
                          <p className="text-xs text-gray-400">
                            {property.bedrooms > 0 && `${property.bedrooms} BHK • `}{property.sqft > 0 && `${property.sqft} sqft`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">{property.area}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{formatPrice(property.price)}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        property.transactionType === 'Sale' ? 'bg-blue-100 text-blue-700' :
                        property.transactionType === 'Rent' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {property.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => toggleFeatured(String(property.id), property.isFeatured)}
                        className={`p-1 rounded transition-colors ${
                          property.isFeatured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${property.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={property.isActive}
                        onCheckedChange={() => toggleActive(String(property.id), property.isActive)}
                        className="scale-90"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <a 
                          href={`/property/${property.id}`} 
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link 
                          to={`/admin/properties/${property.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => deleteProperty(String(property.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No properties found</p>
          <p className="text-sm text-gray-400 mb-4">Try adjusting your filters</p>
          <Link to="/admin/properties/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
