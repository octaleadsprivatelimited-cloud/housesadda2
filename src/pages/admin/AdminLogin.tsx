import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  // Check if already logged in and redirect
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.isLoggedIn && parsed.token) {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (error) {
        // Invalid session, clear it
        localStorage.removeItem('adminSession');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = credentials.username.trim();
    const password = credentials.password;

    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);

      if (!response || !response.success || !response.token) {
        throw new Error(response?.error || response?.message || 'Login failed');
      }

      // Store session
      localStorage.setItem('adminSession', JSON.stringify({
        isLoggedIn: true,
        user: response.user,
        token: response.token,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "Welcome back!",
        description: "Redirecting to dashboard...",
      });

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);

    } catch (error: any) {
      const errorMessage = error?.message || error?.error || "Login failed. Please check your credentials.";
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 accent-gradient rounded-2xl items-center justify-center mb-4">
            <span className="text-accent-foreground font-bold text-2xl">HA</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Admin Portal</h1>
          <p className="text-primary-foreground/70 mt-1">Houses Adda Management</p>
        </div>

        <div className="bg-card rounded-3xl p-8 card-shadow">
          <h2 className="text-xl font-semibold mb-6 text-center">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="pl-12 py-6 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-12 pr-12 py-6 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 rounded-xl font-semibold accent-gradient text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Default credentials:</p>
              <p className="font-mono">Username: admin</p>
              <p className="font-mono">Password: admin123</p>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
