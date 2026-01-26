import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/firebase-auth';
import { authAPI } from '@/lib/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const email = credentials.email.trim();
    const password = credentials.password;
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Authenticate with Firebase Auth
      const firebaseAuthResult = await authService.signIn(email, password);
      
      if (!firebaseAuthResult.success) {
        const errorMsg = firebaseAuthResult.error || 'Authentication failed';
        let userFriendlyMessage = "Invalid email or password";
        
        // Map Firebase Auth errors to user-friendly messages
        if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/invalid-credential')) {
          userFriendlyMessage = "Invalid email or password";
        } else if (errorMsg.includes('auth/wrong-password')) {
          userFriendlyMessage = "Incorrect password";
        } else if (errorMsg.includes('auth/invalid-email')) {
          userFriendlyMessage = "Invalid email address";
        } else if (errorMsg.includes('auth/too-many-requests')) {
          userFriendlyMessage = "Too many failed attempts. Please try again later";
        } else if (errorMsg.includes('auth/network-request-failed')) {
          userFriendlyMessage = "Network error. Please check your connection";
        } else if (errorMsg.includes('auth/user-disabled')) {
          userFriendlyMessage = "This account has been disabled";
        }
        
        throw new Error(userFriendlyMessage);
      }

      if (!firebaseAuthResult.user) {
        throw new Error('Authentication failed. Please try again');
      }

      // Step 2: Get the ID token from Firebase Auth
      let idToken: string;
      try {
        idToken = await firebaseAuthResult.user.getIdToken();
        console.log('🎫 Got ID token from Firebase:', {
          hasToken: !!idToken,
          tokenLength: idToken?.length || 0,
          tokenPreview: idToken ? idToken.substring(0, 30) + '...' : 'none'
        });
        
        if (!idToken || idToken.length === 0) {
          throw new Error('Failed to get authentication token');
        }
      } catch (tokenError: any) {
        console.error('❌ Failed to get ID token:', tokenError);
        throw new Error('Failed to get authentication token. Please try again');
      }
      
      // Step 3: Send ID token to backend to get session token
      let response;
      try {
        console.log('📤 Sending ID token to backend...');
        response = await authAPI.loginWithFirebase(idToken);
        console.log('✅ Backend login successful');
        
        if (!response || !response.success || !response.token || !response.user) {
          throw new Error('Invalid response from server');
        }
      } catch (apiError: any) {
        // Handle API errors
        let apiErrorMessage = "Login failed. Please try again";
        
        if (apiError.message) {
          if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
            apiErrorMessage = "Cannot connect to server. Make sure the backend is running on port 3001";
          } else if (apiError.message.includes('Invalid authentication token')) {
            apiErrorMessage = "Authentication failed. Please try again";
          } else if (apiError.message.includes('ID token')) {
            apiErrorMessage = "Authentication error. Please try again";
          } else {
            apiErrorMessage = apiError.message;
          }
        }
        
        throw new Error(apiErrorMessage);
      }
      
      // Step 4: Store session in localStorage
      try {
        localStorage.setItem('adminSession', JSON.stringify({ 
          isLoggedIn: true, 
          user: response.user,
          token: response.token,
          firebaseUser: {
            uid: firebaseAuthResult.user.uid,
            email: firebaseAuthResult.user.email,
            displayName: firebaseAuthResult.user.displayName
          },
          loginTime: new Date().toISOString()
        }));
      } catch (storageError) {
        throw new Error('Failed to save session. Please try again');
      }
      
      // Step 5: Success - redirect to dashboard
      toast({
        title: "Welcome back!",
        description: "Redirecting to dashboard...",
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
      
    } catch (error: any) {
      // Handle all errors with user-friendly messages
      const errorMessage = error?.message || "An unexpected error occurred. Please try again";
      
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 accent-gradient rounded-2xl items-center justify-center mb-4">
            <span className="text-accent-foreground font-bold text-2xl">HA</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Admin Portal</h1>
          <p className="text-primary-foreground/70 mt-1">Houses Adda Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-3xl p-8 card-shadow">
          <h2 className="text-xl font-semibold mb-6 text-center">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
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
          </form>
        </div>

        {/* Back to site */}
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
