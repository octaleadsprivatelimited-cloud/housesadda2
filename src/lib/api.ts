// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3001/api') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in production (not localhost)
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.startsWith('192.168.');
    
    // In production, use relative URL
    if (isProduction) {
      return '/api';
    }
  }
  
  // In development, use localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  try {
    const session = localStorage.getItem('adminSession');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    }
  } catch (error) {
    // Ignore parse errors
  }
  return null;
};

// Simple in-memory cache for GET requests (5 minutes TTL)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint: string, options: RequestInit) => {
  return `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || {})}`;
};

const getCachedResponse = (key: string) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    requestCache.delete(key);
  }
  return null;
};

// Helper function for API requests with timeout and caching
const apiRequest = async (endpoint: string, options: RequestInit = {}, timeout: number = 30000) => {
  // Use cache for GET requests only
  const isGetRequest = !options.method || options.method === 'GET';
  const cacheKey = isGetRequest ? getCacheKey(endpoint, options) : null;
  
  if (cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      data = { 
        error: `Failed to parse response (${response.status})`, 
        message: `Server returned status ${response.status}` 
      };
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).error = errorMessage;
      (error as any).message = errorMessage;
      (error as any).status = response.status;
      (error as any).responseData = data;
      throw error;
    }

    // Cache successful GET responses
    if (cacheKey && response.ok) {
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      // Limit cache size
      if (requestCache.size > 50) {
        const firstKey = requestCache.keys().next().value;
        requestCache.delete(firstKey);
      }
    }

    return data;
  } catch (error: any) {
    // Log error for debugging
    if (import.meta.env.DEV) {
      console.error('❌ API Request Error:', {
        endpoint,
        url: `${API_BASE_URL}${endpoint}`,
        error: error.message,
        name: error.name,
        stack: error.stack
      });
    }

    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeout / 1000} seconds. The server may be slow or unresponsive.`);
      (timeoutError as any).error = timeoutError.message;
      (timeoutError as any).status = 408;
      throw timeoutError;
    }
    
    // If error already has error/message properties, use them
    if (error.error || error.message) {
      throw error;
    }
    
    // Handle network/fetch errors
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
      let errorMessage = 'Cannot connect to server. ';
      
      if (isLocalhost) {
        errorMessage += 'Make sure the backend server is running on port 3001. Run: npm run dev:server';
      } else {
        errorMessage += 'Please check your internet connection or try again later.';
      }
      
      const networkError = new Error(errorMessage);
      (networkError as any).error = errorMessage;
      (networkError as any).status = 503;
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    
    // Generic error fallback
    const friendlyError = new Error(error.message || 'Network error. Please check your connection and try again.');
    (friendlyError as any).error = friendlyError.message;
    (friendlyError as any).status = 500;
    throw friendlyError;
  }
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  loginWithFirebase: async (idToken: string) => {
    if (!idToken || typeof idToken !== 'string' || idToken.length === 0) {
      throw new Error('Invalid authentication token');
    }
    
    const requestBody = { idToken };
    
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Login failed');
      }
      
      return response;
    } catch (error: any) {
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
         // Search API - optimized for home page filters
         search: async (params?: {
           transactionType?: string;
           area?: string;
           type?: string;
           city?: string;
           budget?: string; // Format: "min-max" or "min-" or "-max"
           minPrice?: number;
           maxPrice?: number;
           limit?: number;
           offset?: number;
           skipImages?: boolean;
         }) => {
           const queryParams = new URLSearchParams();
           if (params) {
             Object.entries(params).forEach(([key, value]) => {
               if (value !== undefined && value !== null) {
                 const stringValue = typeof value === 'boolean' ? String(value) : String(value);
                 queryParams.append(key, stringValue);
               }
             });
           }
           const query = queryParams.toString();
           const url = `/properties/search${query ? `?${query}` : ''}`;
           if (import.meta.env.DEV) {
             console.log('🔍 Search API Call:', url);
           }
           const response = await apiRequest(url);
           return response;
         },

         getAll: async (params?: {
           search?: string;
           type?: string;
           city?: string;
           area?: string;
           featured?: boolean;
           active?: boolean;
           transactionType?: string;
           minPrice?: number;
           maxPrice?: number;
           limit?: number;
           offset?: number;
           skipImages?: boolean;
         }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const stringValue = typeof value === 'boolean' ? String(value) : String(value);
          queryParams.append(key, stringValue);
        }
      });
    }
    if (!params?.limit) {
      queryParams.append('limit', '20');
    }
    const query = queryParams.toString();
    const url = `/properties${query ? `?${query}` : ''}`;
    const response = await apiRequest(url);
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
