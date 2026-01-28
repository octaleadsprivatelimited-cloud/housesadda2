import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { initDatabase } from './db-firebase.js';

import authRoutes from './routes/auth-firebase.js';
import propertyRoutes from './routes/properties-firebase.js';
import locationRoutes from './routes/locations-firebase.js';
import typeRoutes from './routes/types-firebase.js';
import settingsRoutes from './routes/settings-firebase.js';

dotenv.config();

const app = express();

// CORS Configuration - Allow all origins in development, specific origins in production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development' || !process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// Database initialization
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (dbInitialized || !admin.apps.length) {
    return dbInitialized;
  }

  try {
    await initDatabase();
    dbInitialized = true;
    return true;
  } catch (error) {
    console.warn('⚠️  Database initialization failed:', error.message);
    return false;
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/settings', settingsRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Houses Adda API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      routes: '/api/routes',
      auth: '/api/auth',
      properties: '/api/properties',
      locations: '/api/locations',
      types: '/api/types',
      settings: '/api/settings'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const isInitialized = await ensureDatabaseInitialized();
    res.json({
      status: isInitialized ? 'ok' : 'error',
      message: 'Server is running',
      database: isInitialized ? 'Firebase Firestore' : 'Not initialized',
      firebaseProject: process.env.FIREBASE_PROJECT_ID || 'not set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Routes list
app.get('/api/routes', async (req, res) => {
  const isInitialized = await ensureDatabaseInitialized();
  res.json({
    success: true,
    routes: {
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      properties: {
        getAll: 'GET /api/properties',
        getById: 'GET /api/properties/:id',
        create: 'POST /api/properties',
        update: 'PUT /api/properties/:id',
        delete: 'DELETE /api/properties/:id',
        toggleFeatured: 'PATCH /api/properties/:id/featured',
        toggleActive: 'PATCH /api/properties/:id/active'
      },
      locations: {
        getAll: 'GET /api/locations',
        create: 'POST /api/locations',
        update: 'PUT /api/locations/:id',
        delete: 'DELETE /api/locations/:id'
      },
      types: {
        getAll: 'GET /api/types',
        create: 'POST /api/types',
        update: 'PUT /api/types/:id',
        delete: 'DELETE /api/types/:id'
      },
      settings: {
        getSocialMedia: 'GET /api/settings/social-media'
      }
    },
    server: {
      database: isInitialized ? 'initialized' : 'not initialized',
      firebaseProject: process.env.FIREBASE_PROJECT_ID || 'not configured'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

export default app;
