import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Tags, 
  LogOut, 
  Menu, 
  Settings,
  User,
  X,
  Loader2
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Building2, label: 'Properties', path: '/admin/properties' },
  { icon: MapPin, label: 'Locations', path: '/admin/locations' },
  { icon: Tags, label: 'Property Types', path: '/admin/types' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

// Memoized menu item component for better performance
const MenuItem = memo(({ item, isActive, onNavigate }: { 
  item: typeof menuItems[0], 
  isActive: boolean,
  onNavigate: () => void 
}) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg smooth-transition-fast
        ${isActive 
          ? 'bg-primary text-white' 
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium text-sm">{item.label}</span>
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminName, setAdminName] = useState('Sreekanth');

  useEffect(() => {
    // Optimize auth check - make it synchronous and fast
    const checkAuth = () => {
      try {
        const session = localStorage.getItem('adminSession');
        if (session) {
          try {
            const parsed = JSON.parse(session);
            if (parsed.isLoggedIn && parsed.token) {
              setIsAuthenticated(true);
              if (parsed.user?.email || parsed.username) {
                setAdminName(parsed.user?.email || parsed.username || 'Admin');
              }
              // If on /admin path, redirect to dashboard
              if (location.pathname === '/admin' || location.pathname === '/admin/') {
                navigate('/admin/dashboard', { replace: true });
              }
              setIsCheckingAuth(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing session:', error);
            localStorage.removeItem('adminSession');
          }
        }
        
        // Not authenticated - redirect to login immediately
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        // Redirect to login page
        navigate('/admin', { replace: true });
      } catch (error) {
        console.error('Auth check error:', error);
        setIsCheckingAuth(false);
        setIsAuthenticated(false);
        // Only redirect if not already on login page
        if (location.pathname !== '/admin' && !location.pathname.startsWith('/admin/login')) {
          navigate('/admin', { replace: true });
        }
      }
    };

    // Run auth check immediately (no async operations)
    checkAuth();
  }, [navigate, location.pathname]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  }, [navigate]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Memoize active path check
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirect message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Overlay - Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden smooth-transition-fast"
          onClick={handleSidebarClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#2c3e50] to-[#1a252f]
        transform smooth-transition gpu-accelerated
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* User Profile Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{adminName}</h3>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-smooth optimize-rendering">
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                item={item}
                isActive={activePath === item.path}
                onNavigate={handleSidebarClose}
              />
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 smooth-transition-fast"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Menu Button Only */}
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm px-4 py-3 gpu-accelerated">
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 smooth-transition-fast"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto scrollbar-smooth optimize-rendering">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default memo(AdminLayout);
