import app from './app.js';
import { initDatabase, closeDatabase, initializeFirebase } from './db-firebase.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('🔧 Initializing Firebase...');
    const initResult = initializeFirebase();

    if (initResult && admin.apps.length > 0) {
      console.log('✅ Firebase Admin SDK initialized');

      try {
        await initDatabase();
        console.log('✅ Database initialized');
      } catch (dbError) {
        console.warn('⚠️  Database initialization failed:', dbError.message);
      }
    } else {
      console.error('❌ Firebase initialization failed!');
      console.error('❌ Check FIREBASE_SERVICE_ACCOUNT in .env file.');
    }

    app.listen(PORT, () => {
      console.log('\n🚀 ========== SERVER STARTED ==========');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'Not configured'}`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   🔐 POST   /api/auth/login          - Admin login`);
      console.log(`   🔍 GET    /api/auth/verify         - Verify token`);
      console.log(`   ❤️  GET    /api/health              - Health check`);
      console.log(`   📋 GET    /api/routes              - List all routes`);
      console.log('========================================\n');
    });

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
