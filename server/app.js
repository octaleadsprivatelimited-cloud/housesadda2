// Express app configuration (works for both local server and Vercel serverless)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { initDatabase } from './db-firebase.js';

// Import routes
import authRoutes from './routes/auth-firebase.js';
import propertyRoutes from './routes/properties-firebase.js';
import locationRoutes from './routes/locations-firebase.js';
import typeRoutes from './routes/types-firebase.js';
import settingsRoutes from './routes/settings-firebase.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true, // Allow all origins in dev, set specific in production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (will be called once per serverless instance)
let dbInitialized = false;
let dbInitPromise = null;

async function ensureDatabaseInitialized() {
  // First, ensure Firebase Admin SDK is initialized
  if (!admin.apps.length) {
    // Import db-firebase to trigger Firebase Admin initialization
    try {
      await import('./db-firebase.js');
    } catch (importError) {
      console.error('❌ Failed to import Firebase Admin:', importError.message);
      return false;
    }
  }
  
  if (dbInitialized) {
    return true;
  }
  
  if (dbInitPromise) {
    return dbInitPromise;
  }
  
  dbInitPromise = (async () => {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('✅ Firebase Firestore initialized');
      return true;
    } catch (dbError) {
      console.warn('⚠️  Database initialization failed:', dbError.message);
      console.warn('⚠️  Add FIREBASE_SERVICE_ACCOUNT_PATH to .env to enable database.');
      dbInitialized = false;
      return false;
    }
  })();
  
  return dbInitPromise;
}

// Middleware to ensure database is initialized before handling requests
app.use(async (req, res, next) => {
  await ensureDatabaseInitialized();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const isInitialized = await ensureDatabaseInitialized();
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    database: isInitialized ? 'Firebase Firestore' : 'Not initialized',
    configured: isInitialized ? 'yes' : 'no',
    timestamp: new Date().toISOString()
  });
});

// Route status endpoint
app.get('/api/routes', async (req, res) => {
  const isInitialized = await ensureDatabaseInitialized();
  res.json({
    success: true,
    routes: {
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        test: 'GET /api/auth/test-route',
        listUsers: 'GET /api/auth/list-users'
      },
      properties: {
        getAll: 'GET /api/properties',
        getById: 'GET /api/properties/:id',
        create: 'POST /api/properties',
        update: 'PUT /api/properties/:id',
        delete: 'DELETE /api/properties/:id'
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
      health: 'GET /api/health',
      routes: 'GET /api/routes'
    },
    server: {
      database: isInitialized ? 'initialized' : 'not initialized',
      firebaseProject: process.env.FIREBASE_PROJECT_ID || 'not configured',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: {
      auth: '/api/auth',
      properties: '/api/properties',
      locations: '/api/locations',
      types: '/api/types',
      health: '/api/health',
      routes: '/api/routes'
    }
  });
});

// Global error handler middleware (must be last)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  console.error('   Method:', req.method);
  console.error('   URL:', req.originalUrl);
  console.error('   Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
