import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, MapPin, Loader2, X, Check, Building2, Search, Filter, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { locationsAPI, propertiesAPI } from '@/lib/api';

const AdminLocations = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<any[]>([]);
  const [propertyCount, setPropertyCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', city: 'Hyderabad' });
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', city: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationsAPI.getAll();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setLocations(data);
      
      // Load property counts
      try {
        const props = await propertiesAPI.getAll({ active: true });
        const counts: Record<string, number> = {};
        data.forEach((loc: any) => {
          counts[loc.name] = props.filter((p: any) => p.area === loc.name).length;
        });
        setPropertyCount(counts);
      } catch (propError) {
        console.warn('Failed to load property counts:', propError);
      }
    } catch (error: any) {
      console.error('Error loading locations:', error);
      const errorMessage = error?.message || error?.error || 'Failed to load locations';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLocation = async () => {
    if (!newLocation.name.trim() || !newLocation.city.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and city",
        variant: "destructive",
      });
      return;
    }

    try {
      await locationsAPI.create(newLocation);
      toast({ title: "Success", description: `${newLocation.name} added successfully` });
      setNewLocation({ name: '', city: 'Hyderabad' });
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add location",
        variant: "destructive",
      });
    }
  };

  const deleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await locationsAPI.delete(id);
      toast({ title: "Deleted", description: "Location deleted successfully", variant: "destructive" });
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const startEdit = useCallback((location: any) => {
    setEditingLocation(location.id);
    setEditData({ name: location.name, city: location.city });
  }, []);

  const saveEdit = async () => {
    if (!editingLocation || !editData.name.trim()) return;

    try {
      await locationsAPI.update(editingLocation, editData);
      toast({ title: "Updated", description: "Location updated successfully" });
      setEditingLocation(null);
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = useCallback(() => {
    setEditingLocation(null);
    setEditData({ name: '', city: '' });
  }, []);

  // Memoize expensive computations
  const cities = useMemo(() => 
    Array.from(new Set(locations.map(l => l.city))).sort(),
    [locations]
  );
  
  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(query) ||
                            loc.city.toLowerCase().includes(query);
      const matchesCity = selectedCity === 'all' || loc.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [locations, searchQuery, selectedCity]);

  const locationsByCity = useMemo(() => {
    return filteredLocations.reduce((acc, loc) => {
      if (!acc[loc.city]) acc[loc.city] = [];
      acc[loc.city].push(loc);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredLocations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg shadow-sm">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            Manage Locations
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {locations.length} locations • {cities.length} {cities.length === 1 ? 'city' : 'cities'}
          </p>
        </div>
      </div>

      {/* Compact Add Location Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-primary" />
          <h2 className="text-sm md:text-base font-semibold text-gray-900">Add New Location</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[150px]">
            <input
              type="text"
              value={newLocation.name}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Area name"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
          </div>
          <div className="w-36 md:w-40">
            <input
              type="text"
              value={newLocation.city}
              onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
          </div>
          <Button 
            onClick={addLocation} 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Compact Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          
          {/* City Filter */}
          <div className="relative sm:w-40">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Locations Display */}
      {Object.entries(locationsByCity).sort().map(([city, cityLocations]) => (
        <div key={city} className="space-y-2.5">
          {/* Compact City Header */}
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 bg-blue-500 rounded-md shadow-sm">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">{city}</h3>
              <p className="text-xs text-gray-500">{cityLocations.length} {cityLocations.length === 1 ? 'location' : 'locations'}</p>
            </div>
          </div>
          
          {/* Locations Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
              {cityLocations.map((location) => (
                editingLocation === location.id ? (
                  <div key={location.id} className="bg-white rounded-lg border-2 border-primary shadow-md p-3 transition-all">
                    <div className="space-y-2">
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        placeholder="Location name"
                      />
                      <input
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        placeholder="City"
                      />
                      <div className="flex gap-1.5">
                        <button 
                          onClick={saveEdit} 
                          className="flex-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-xs font-medium"
                        >
                          <Check className="h-3 w-3 inline mr-1" />
                          Save
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={location.id}
                    className="group bg-white rounded-lg border border-gray-300 hover:border-primary shadow-sm hover:shadow-md p-3 transition-all cursor-default"
                  >
                    {/* Location Icon & Name */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                            {location.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">{location.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Property Count Badge */}
                    {propertyCount[location.name] > 0 && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          <Building2 className="h-3 w-3" />
                          {propertyCount[location.name]}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(location)}
                        className="flex-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteLocation(location.id)}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                        aria-label="Delete location"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {cityLocations.map((location) => (
                  editingLocation === location.id ? (
                    <div key={location.id} className="p-3 bg-blue-50 border-l-4 border-primary">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          placeholder="Location name"
                        />
                        <input
                          value={editData.city}
                          onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          placeholder="City"
                        />
                        <div className="col-span-2 flex gap-1.5">
                          <button 
                            onClick={saveEdit} 
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Save
                          </button>
                          <button 
                            onClick={cancelEdit} 
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={location.id}
                      className="group p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-1.5 bg-primary/10 rounded-md">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors">
                              {location.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">{location.city}</p>
                          </div>
                          {propertyCount[location.name] > 0 && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                              {propertyCount[location.name]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(location)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            aria-label="Edit location"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteLocation(location.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            aria-label="Delete location"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No locations found</h3>
          <p className="text-gray-500 text-xs">
            {searchQuery || selectedCity !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first location'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;
