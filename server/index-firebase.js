// Local server entry point - starts Express server for development/production
import app from './app.js';
import { initDatabase, closeDatabase } from './db-firebase.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    try {
      await initDatabase();
      console.log('✅ Firebase Firestore initialized');
    } catch (dbError) {
      console.warn('⚠️  Database initialization failed:', dbError.message);
      console.warn('⚠️  Server will start but database operations will fail.');
      console.warn('⚠️  Add FIREBASE_SERVICE_ACCOUNT_PATH to .env to enable database.');
    }
    
    app.listen(PORT, () => {
      console.log('\n🚀 ========== SERVER STARTED ==========');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || '⚠️  Not configured'}`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   🔐 POST   /api/auth/login          - User login`);
      console.log(`   🔍 GET    /api/auth/verify         - Verify token`);
      console.log(`   🧪 GET    /api/auth/test-route     - Test auth route`);
      console.log(`   ❤️  GET    /api/health              - Health check`);
      console.log(`   📋 GET    /api/routes              - List all routes`);
      console.log(`   🧪 GET    /api/test                - Test route`);
      console.log('\n💡 Tip: Visit http://localhost:' + PORT + '/api/routes to see all available endpoints');
      console.log('========================================\n');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
