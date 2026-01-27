import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

export function initializeFirebase() {
  if (admin.apps.length > 0) {
    firebaseInitialized = true;
    return true;
  }

  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT not set in .env');
      return false;
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK initialized');
    console.log(`   Project: ${serviceAccount.project_id}`);
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

// Get Firestore database instance
export function getDb() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Call initializeFirebase() first.');
  }
  return admin.firestore();
}

// Initialize database with default data
export async function initDatabase() {
  try {
    const db = getDb();
    console.log('📦 Initializing database...');

    // Create default admin user
    const adminSnapshot = await db.collection('admin_users')
      .where('username', '==', 'admin')
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.default.hashSync('admin123', 10);
      
      await db.collection('admin_users').add({
        username: 'admin',
        password: hashedPassword,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Default admin user created (admin/admin123)');
    }

    // Create default property types
    const typesSnapshot = await db.collection('property_types').limit(1).get();
    if (typesSnapshot.empty) {
      const batch = db.batch();
      ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'].forEach(name => {
        const ref = db.collection('property_types').doc();
        batch.set(ref, { name, created_at: admin.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
      console.log('✅ Default property types created');
    }

    // Create default locations
    const locationsSnapshot = await db.collection('locations').limit(1).get();
    if (locationsSnapshot.empty) {
      const batch = db.batch();
      const defaultLocations = [
        { name: 'Gachibowli', city: 'Hyderabad' },
        { name: 'Hitech City', city: 'Hyderabad' },
        { name: 'Kondapur', city: 'Hyderabad' },
        { name: 'Jubilee Hills', city: 'Hyderabad' },
        { name: 'Banjara Hills', city: 'Hyderabad' },
        { name: 'Madhapur', city: 'Hyderabad' }
      ];
      defaultLocations.forEach(location => {
        const ref = db.collection('locations').doc();
        batch.set(ref, { ...location, created_at: admin.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
      console.log('✅ Default locations created');
    }

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

export function closeDatabase() {
  return Promise.resolve();
}

// Initialize on module load
initializeFirebase();
