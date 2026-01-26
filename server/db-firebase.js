import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Option 1: Use service account JSON as environment variable (PRIORITY for Vercel/serverless)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' 
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : process.env.FIREBASE_SERVICE_ACCOUNT;
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT');
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError.message);
        throw parseError;
      }
    }
    // Option 2: Use individual credentials from env (also works in Vercel)
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        })
      });
      console.log('✅ Firebase Admin initialized with individual credentials');
    }
    // Option 3: Use service account JSON file path (local development only - won't work in Vercel)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      try {
        // Import fs module - this will fail in serverless, but we check VERCEL first
        const fs = await import('fs');
        const readFileSync = fs.readFileSync || fs.default?.readFileSync;
        if (readFileSync) {
          const serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          console.log('✅ Firebase Admin initialized with service account file');
        } else {
          throw new Error('readFileSync not available');
        }
      } catch (fileError) {
        console.error('❌ Failed to read service account file:', fileError.message);
        // Only throw in local dev; in serverless, this option is skipped anyway
        throw fileError;
      }
    }
    // Option 4: Use project ID only (for Firebase hosting/Cloud Run with default credentials)
    else if (process.env.FIREBASE_PROJECT_ID) {
      console.warn('⚠️  Initializing Firebase Admin with project ID only.');
      console.warn('⚠️  This may not work for authentication operations.');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
    // Option 5: Use default credentials (for Firebase hosting/Cloud Run)
    else {
      console.warn('⚠️  Initializing Firebase Admin with default credentials.');
      console.warn('⚠️  This may not work. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID in environment variables.');
      admin.initializeApp();
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack:', error.stack);
    // Don't throw in serverless - let it fail gracefully
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Firebase initialization failed in production. Check environment variables.');
    } else {
      throw new Error('Firebase initialization failed: ' + error.message);
    }
  }
}

export const db = admin.firestore();

// Helper functions to match SQLite/MySQL interface
export const dbGet = async (collection, filters = {}) => {
  try {
    let query = db.collection(collection);
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      query = query.where(key, '==', filters[key]);
    });
    
    const snapshot = await query.limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(`Error in dbGet for ${collection}:`, error);
    throw error;
  }
};

export const dbAll = async (collection, filters = {}, orderBy = null) => {
  try {
    let query = db.collection(collection);
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (Array.isArray(filters[key])) {
        query = query.where(key, 'in', filters[key]);
      } else {
        query = query.where(key, '==', filters[key]);
      }
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.orderBy(orderBy.column, orderBy.ascending !== false ? 'asc' : 'desc');
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error in dbAll for ${collection}:`, error);
    throw error;
  }
};

export const dbRun = async (collection, operation, data, filters = {}) => {
  try {
    if (operation === 'insert') {
      const docRef = await db.collection(collection).add(data);
      const doc = await docRef.get();
      return {
        lastID: doc.id,
        changes: 1,
        data: { id: doc.id, ...doc.data() }
      };
    } else if (operation === 'update') {
      let query = db.collection(collection);
      
      // Apply filters for WHERE clause
      Object.keys(filters).forEach(key => {
        query = query.where(key, '==', filters[key]);
      });
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return { changes: 0 };
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { ...data, updated_at: admin.firestore.FieldValue.serverTimestamp() });
      });
      
      await batch.commit();
      
      return {
        changes: snapshot.size,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } else if (operation === 'delete') {
      let query = db.collection(collection);
      
      // Apply filters for WHERE clause
      Object.keys(filters).forEach(key => {
        query = query.where(key, '==', filters[key]);
      });
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return { changes: 0 };
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      return {
        changes: snapshot.size
      };
    }
  } catch (error) {
    console.error(`Error in dbRun for ${collection}:`, error);
    throw error;
  }
};

// Initialize database schema (create collections and default data)
export async function initDatabase() {
  try {
    console.log('✅ Connected to Firebase Firestore');
    console.log('📦 Using Firebase database');
    
    // Check and create default admin user
    const adminSnapshot = await db.collection('admin_users')
      .where('username', '==', 'admin')
      .limit(1)
      .get();
    
    if (adminSnapshot.empty) {
      console.log('📝 Creating default admin user...');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.default.hashSync('admin123', 10);
      
      const adminRef = await db.collection('admin_users').add({
        username: 'admin',
        password: hashedPassword,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Admin user created in Firestore');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Document ID:', adminRef.id);
    } else {
      const adminUser = adminSnapshot.docs[0].data();
      console.log('✅ Admin user already exists in Firestore');
      console.log('   Username: admin');
      console.log('   Document ID:', adminSnapshot.docs[0].id);
    }
    
    // Check and create default property types
    const typesSnapshot = await db.collection('property_types').limit(1).get();
    
    if (typesSnapshot.empty) {
      const defaultTypes = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
      const batch = db.batch();
      
      defaultTypes.forEach(name => {
        const ref = db.collection('property_types').doc();
        batch.set(ref, {
          name,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Property types created');
    }
    
    // Check and create default locations
    const locationsSnapshot = await db.collection('locations').limit(1).get();
    
    if (locationsSnapshot.empty) {
      const defaultLocations = [
        { name: 'Gachibowli', city: 'Hyderabad' },
        { name: 'Hitech City', city: 'Hyderabad' },
        { name: 'Kondapur', city: 'Hyderabad' },
        { name: 'Jubilee Hills', city: 'Hyderabad' },
        { name: 'Banjara Hills', city: 'Hyderabad' },
        { name: 'Madhapur', city: 'Hyderabad' },
        { name: 'Kukatpally', city: 'Hyderabad' },
        { name: 'Miyapur', city: 'Hyderabad' },
        { name: 'Kompally', city: 'Hyderabad' },
        { name: 'Financial District', city: 'Hyderabad' },
        { name: 'Shamirpet', city: 'Hyderabad' }
      ];
      
      const batch = db.batch();
      defaultLocations.forEach(location => {
        const ref = db.collection('locations').doc();
        batch.set(ref, {
          ...location,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Default locations created');
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Close database connection (Firebase doesn't need explicit closing)
export function closeDatabase() {
  return Promise.resolve();
}

export default db;
