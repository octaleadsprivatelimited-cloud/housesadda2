import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Plus,
  ArrowUpRight,
  Loader2,
  Home,
  Key,
  FileText,
  Users,
  MapPin,
  Clock,
  Search,
  UserPlus,
  Activity,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';

const transactionTypes = ['All', 'Sale', 'Rent', 'Lease', 'PG'];

// Mini bar chart component for stat cards
const MiniBarChart = ({ color }: { color: string }) => {
  const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 55, 90];
  return (
    <div className="flex items-end gap-0.5 h-5 mt-1">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1 rounded-t ${color}`}
          style={{ height: `${height}%`, opacity: 0.7 + (i * 0.025) }}
        />
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    active: 0,
    inactive: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedFilter]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // CRITICAL OPTIMIZATION: Load only minimal data for dashboard stats
      // Use a small limit and skip images to make it load instantly
      const params: any = { 
        limit: 50, // Further reduced for faster loading
        offset: 0,
        skipImages: true // Skip images completely for dashboard
      };
      if (selectedFilter !== 'All') {
        params.transactionType = selectedFilter;
      }
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await Promise.race([
          propertiesAPI.getAll(params),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]) as any;
        
        clearTimeout(timeoutId);
        
        // Handle both array response and object with properties array
        const allProperties = Array.isArray(response) ? response : (response.properties || response || []);
        const filteredProperties = allProperties;
        
        const activeProperties = filteredProperties.filter((p: any) => p.isActive === true || p.isActive === 'true');
        const featuredProperties = filteredProperties.filter((p: any) => p.isFeatured === true || p.isFeatured === 'true');

        setStats({
          total: filteredProperties.length,
          featured: featuredProperties.length,
          active: activeProperties.length,
          inactive: filteredProperties.length - activeProperties.length,
        });

        // Only get recent 4 properties for display
        const recent = filteredProperties
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 4)
          .map((p: any) => ({
            id: String(p.id),
            title: p.title,
            area: p.area || '',
            price: formatPrice(p.price),
            status: p.isActive ? 'Active' : 'Inactive',
            transactionType: p.transactionType || 'Sale',
            createdAt: p.createdAt
          }));
        
        setRecentProperties(recent);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.message === 'Request timeout') {
          console.warn('Dashboard data load timed out, showing cached/empty data');
          // Set default stats instead of failing
          setStats({
            total: 0,
            featured: 0,
            active: 0,
            inactive: 0,
          });
          setRecentProperties([]);
          return; // Don't throw, just show empty state
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      // Show error to user but don't block the UI
      setStats({
        total: 0,
        featured: 0,
        active: 0,
        inactive: 0,
      });
      setRecentProperties([]);
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

  const statCards = [
    { 
      label: 'Total Properties', 
      value: stats.total, 
      icon: UserPlus,
      bgColor: 'bg-gradient-to-br from-teal-400 to-teal-500',
      barColor: 'bg-teal-200',
      link: '/admin/properties'
    },
    { 
      label: 'Featured', 
      value: stats.featured, 
      icon: Users,
      bgColor: 'bg-gradient-to-br from-amber-400 to-amber-500',
      barColor: 'bg-amber-200',
      link: '/admin/properties?filter=featured'
    },
    { 
      label: 'Active', 
      value: stats.active, 
      icon: Search,
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-500',
      barColor: 'bg-purple-200',
      link: '/admin/properties?filter=active'
    },
    { 
      label: 'Inactive', 
      value: stats.inactive, 
      icon: Activity,
      bgColor: 'bg-gradient-to-br from-rose-400 to-rose-500',
      barColor: 'bg-rose-200',
      link: '/admin/properties?filter=inactive'
    },
  ];

  // Show UI immediately, load data in background
  // This prevents the "blank screen" issue
  if (isLoading && stats.total === 0 && recentProperties.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <Link to="/admin/properties/new">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/admin/properties/new">
          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {transactionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedFilter === type 
                ? 'bg-primary text-white shadow' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <span className="flex items-center gap-1">
              {type === 'All' && <Building2 className="h-3 w-3" />}
              {type === 'Sale' && <Home className="h-3 w-3" />}
              {type === 'Rent' && <Key className="h-3 w-3" />}
              {type === 'Lease' && <FileText className="h-3 w-3" />}
              {type === 'PG' && <Users className="h-3 w-3" />}
              {type}
            </span>
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Link 
            key={stat.label}
            to={stat.link}
            className={`${stat.bgColor} rounded-lg p-3 text-white shadow hover:scale-105 transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-white/80 text-[10px] font-medium">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-5 w-5 text-white/50" />
            </div>
            <MiniBarChart color={stat.barColor} />
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Column - Recent Properties */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-gray-800">Recent Properties</h3>
                </div>
                <Link to="/admin/properties" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-0.5">
                  View All
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            
            <div className="p-2">
              {recentProperties.length > 0 ? (
                <div className="space-y-1.5">
                  {recentProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/admin/properties/${property.id}/edit`}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                            {property.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{property.area}</span>
                            <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                              property.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {property.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{property.price}</p>
                        <p className="text-[10px] text-gray-500">{property.transactionType}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No properties found</p>
                  <Link to="/admin/properties/new">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Property
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Quick Stats */}
        <div className="space-y-4">
          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <h3 className="font-medium text-sm text-gray-800">Activity</h3>
            </div>
            <div className="p-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">New property added</p>
                  <p className="text-[10px] text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">Status changed to Active</p>
                  <p className="text-[10px] text-gray-400">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">Location added</p>
                  <p className="text-[10px] text-gray-400">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">Marked as Featured</p>
                  <p className="text-[10px] text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-primary to-red-500 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4" />
              <h3 className="font-medium text-sm">Quick Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-white/70 text-[10px]">Total</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-lg font-bold">{stats.active}</p>
                <p className="text-white/70 text-[10px]">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
