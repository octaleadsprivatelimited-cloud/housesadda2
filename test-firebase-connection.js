// Test Firebase connection status
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking Firebase Connection Status...\n');

// Check Frontend Configuration (Client SDK)
console.log('📱 Frontend Firebase (Client SDK):');
const frontendConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const frontendConfigured = Object.values(frontendConfig).every(val => val && val !== '');
console.log('   ✅ API Key:', frontendConfig.apiKey ? 'Set' : '❌ Missing');
console.log('   ✅ Auth Domain:', frontendConfig.authDomain ? 'Set' : '❌ Missing');
console.log('   ✅ Project ID:', frontendConfig.projectId ? 'Set' : '❌ Missing');
console.log('   ✅ Storage Bucket:', frontendConfig.storageBucket ? 'Set' : '❌ Missing');
console.log('   ✅ Messaging Sender ID:', frontendConfig.messagingSenderId ? 'Set' : '❌ Missing');
console.log('   ✅ App ID:', frontendConfig.appId ? 'Set' : '❌ Missing');
console.log('   Status:', frontendConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');

// Check Backend Configuration (Admin SDK)
console.log('\n🔧 Backend Firebase (Admin SDK):');
const backendProjectId = process.env.FIREBASE_PROJECT_ID;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log('   ✅ Project ID:', backendProjectId ? 'Set' : '❌ Missing');
console.log('   ✅ Service Account Path:', serviceAccountPath ? `Set (${serviceAccountPath})` : '❌ Not set');
console.log('   ✅ Service Account (Env):', serviceAccountEnv ? 'Set' : '❌ Not set');
console.log('   ✅ Private Key:', privateKey ? 'Set' : '❌ Not set');
console.log('   ✅ Client Email:', clientEmail ? 'Set' : '❌ Not set');

// Check if service account file exists
let serviceAccountFileExists = false;
if (serviceAccountPath) {
  const fullPath = join(__dirname, serviceAccountPath.replace(/^\.\//, ''));
  serviceAccountFileExists = existsSync(fullPath);
  console.log('   📄 Service Account File:', serviceAccountFileExists ? `✅ Found at ${fullPath}` : `❌ Not found at ${fullPath}`);
}

// Determine backend configuration status
const backendConfigured = 
  (serviceAccountPath && serviceAccountFileExists) ||
  serviceAccountEnv ||
  (privateKey && clientEmail && backendProjectId);

console.log('   Status:', backendConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');

// Try to initialize Firebase Admin
console.log('\n🧪 Testing Firebase Admin Initialization:');
try {
  const { db } = await import('./server/db-firebase.js');
  console.log('   ✅ Firebase Admin SDK initialized successfully');
  console.log('   ✅ Firestore database connection:', db ? 'Ready' : 'Not ready');
  
  // Try a simple operation
  try {
    const testCollection = db.collection('_test_connection');
    await testCollection.limit(1).get();
    console.log('   ✅ Firestore read operation: SUCCESS');
    console.log('\n🎉 Firebase is FULLY CONNECTED!');
  } catch (dbError) {
    console.log('   ⚠️  Firestore read operation failed:', dbError.message);
    console.log('   Status: ⚠️  PARTIALLY CONNECTED (initialized but operations may fail)');
  }
} catch (initError) {
  console.log('   ❌ Firebase Admin SDK initialization failed:', initError.message);
  console.log('   Status: ❌ NOT CONNECTED');
  
  if (initError.message.includes('service account') || initError.message.includes('credential')) {
    console.log('\n💡 Solution:');
    console.log('   1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('   2. Click "Generate new private key"');
    console.log('   3. Save the JSON file as "serviceAccountKey.json" in the project root');
    console.log('   4. Uncomment FIREBASE_SERVICE_ACCOUNT_PATH in .env file');
    console.log('   5. Or set FIREBASE_SERVICE_ACCOUNT environment variable with the JSON content');
  }
}

console.log('\n📋 Summary:');
console.log(`   Frontend: ${frontendConfigured ? '✅ Ready' : '❌ Not configured'}`);
console.log(`   Backend: ${backendConfigured ? '✅ Ready' : '❌ Not configured'}`);

if (!backendConfigured) {
  console.log('\n⚠️  Backend Firebase Admin SDK is not configured.');
  console.log('   The backend API will not work without proper Firebase credentials.');
  console.log('   See DEPLOYMENT_FIREBASE.md for setup instructions.');
}

process.exit(0);
