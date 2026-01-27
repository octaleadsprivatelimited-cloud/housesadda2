// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3001/api') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in production (not localhost)
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.startsWith('192.168.');
  
  // In production, use relative URL to avoid localhost issues
  // This assumes the API is on the same domain or proxied via Vercel
  if (isProduction) {
    console.log('🌐 Using relative API URL for production');
    return '/api';
  }
  
  // In development, use localhost
  console.log('🌐 Using localhost API URL for development');
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 API Base URL:', API_BASE_URL);

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const session = localStorage.getItem('adminSession');
  if (session) {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log('🌐 API Request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: Object.keys(headers),
      hasBody: !!options.body,
      bodyPreview: options.body ? String(options.body).substring(0, 100) : 'none'
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'Request failed', message: text || 'Request failed' };
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      data = { 
        error: `Failed to parse response (${response.status})`, 
        message: `Server returned status ${response.status}` 
      };
    }

    if (!response.ok) {
      // Log the error for debugging
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: `${API_BASE_URL}${endpoint}`
      });

      // Create error object with detailed message
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).error = errorMessage;
      (error as any).message = errorMessage;
      (error as any).status = response.status;
      (error as any).responseData = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.error || error.message) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Cannot connect to server. Make sure the backend is running on port 3001');
      (networkError as any).error = networkError.message;
      throw networkError;
    }
    
    // Otherwise, create a user-friendly error
    const friendlyError = new Error(error.message || 'Network error. Please check your connection.');
    (friendlyError as any).error = friendlyError.message;
    throw friendlyError;
  }
};

// Auth API
export const authAPI = {
  // Legacy login (username/password) - kept for backward compatibility
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  // Firebase Auth login (recommended)
  loginWithFirebase: async (idToken: string) => {
    if (!idToken || typeof idToken !== 'string' || idToken.length === 0) {
      throw new Error('Invalid authentication token');
    }
    
    const requestBody = { idToken };
    
    console.log('📤 API: Preparing login request:', {
      hasIdToken: !!idToken,
      idTokenLength: idToken.length,
      requestBodyKeys: Object.keys(requestBody),
      endpoint: '/auth/login',
      apiBaseUrl: API_BASE_URL
    });
    
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('✅ API: Login response received:', {
        success: response?.success,
        hasToken: !!response?.token,
        hasUser: !!response?.user
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Login failed');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ API: Login error:', {
        message: error.message,
        error: error.error,
        status: error.status
      });
      
      // Re-throw with better error message
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to connect to server. Please try again');
    }
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },
  verify: async () => {
    return apiRequest('/auth/verify');
  },
  
  updateCredentials: async (currentPassword: string, newUsername?: string, newPassword?: string) => {
    return apiRequest('/auth/update-credentials', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newUsername, newPassword }),
    });
  },

  updateProfile: async (displayName?: string, email?: string) => {
    return apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName, email }),
    });
  },
};

// Properties API
export const propertiesAPI = {
  getAll: async (params?: {
    search?: string;
    type?: string;
    city?: string;
    area?: string;
    featured?: boolean;
    active?: boolean;
    transactionType?: string;
    limit?: number;
    offset?: number;
    skipImages?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert boolean to string 'true' or 'false'
          const stringValue = typeof value === 'boolean' ? String(value) : String(value);
          queryParams.append(key, stringValue);
        }
      });
    }
    // Only add default limit if not specified AND not in admin context
    // Admin panel should explicitly pass limit
    if (!params?.limit) {
      queryParams.append('limit', '20');
    }
    const query = queryParams.toString();
    const url = `/properties${query ? `?${query}` : ''}`;
    console.log('🌐 API Call:', url);
    const response = await apiRequest(url);
    // Return response as-is (could be array or object with properties array)
    return response;
  },

  getById: async (id: string) => {
    return apiRequest(`/properties/${id}`);
  },

  create: async (property: any) => {
    return apiRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  update: async (id: string, property: any) => {
    return apiRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  toggleFeatured: async (id: string, isFeatured: boolean) => {
    return apiRequest(`/properties/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    });
  },

  toggleActive: async (id: string, isActive: boolean) => {
    return apiRequest(`/properties/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

// Locations API
export const locationsAPI = {
  getAll: async (city?: string) => {
    const query = city ? `?city=${city}` : '';
    return apiRequest(`/locations${query}`);
  },

  create: async (location: { name: string; city: string }) => {
    return apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  },

  update: async (id: string, location: { name: string; city: string }) => {
    return apiRequest(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/locations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Types API
export const typesAPI = {
  getAll: async () => {
    return apiRequest('/types');
  },

  create: async (name: string) => {
    return apiRequest('/types', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: number, name: string) => {
    return apiRequest(`/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/types/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsAPI = {
  getSocialMedia: async () => {
    return apiRequest('/settings/social-media');
  },

  updateSocialMedia: async (socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  }) => {
    return apiRequest('/settings/social-media', {
      method: 'PUT',
      body: JSON.stringify(socialMedia),
    });
  },
};

