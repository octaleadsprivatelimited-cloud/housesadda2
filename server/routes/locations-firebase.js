import express from 'express';
import { db } from '../db-firebase.js';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = db.collection('locations');

    if (city) {
      query = query.where('city', '==', city);
    }

    // Firestore: Get all documents without orderBy to avoid index requirements
    // We'll sort in JavaScript instead
    const snapshot = await query.get();

    let locations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        city: data.city || '',
        created_at: data.created_at || null
      };
    });

    // Sort by city first, then by name within each city
    locations.sort((a, b) => {
      const cityA = (a.city || '').toLowerCase();
      const cityB = (b.city || '').toLowerCase();
      if (cityA !== cityB) {
        return cityA.localeCompare(cityB);
      }
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    console.log(`✅ Retrieved ${locations.length} locations`);
    res.json(locations);
  } catch (error) {
    console.error('❌ Get locations error:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    
    // Provide more detailed error information
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to retrieve locations',
      code: error.code || 'UNKNOWN_ERROR',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error.toString()
      })
    });
  }
});

// Create location (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'Name and city are required' });
    }

    // Check if location already exists
    const existingSnapshot = await db.collection('locations')
      .where('name', '==', name)
      .where('city', '==', city)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Location already exists' });
    }

    const docRef = await db.collection('locations').add({
      name,
      city,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city } = req.body;

    await db.collection('locations').doc(id).update({
      name,
      city
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete location (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.collection('locations').doc(id).delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
