import express from 'express';
import { getDb } from '../db-firebase.js';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getDatabase() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Please restart the server.');
  }
  return getDb();
}

// Get all locations
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { city } = req.query;

    let query = db.collection('locations');
    if (city) query = query.where('city', '==', city);

    const snapshot = await query.get();
    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      city: doc.data().city || ''
    }));

    // Sort by city, then name
    locations.sort((a, b) => {
      if (a.city !== b.city) return a.city.localeCompare(b.city);
      return a.name.localeCompare(b.name);
    });

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    if (error.message.includes('not initialized')) {
      return res.status(503).json({
        error: 'Database not available',
        message: error.message
      });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Create location (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
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
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update location (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name, city } = req.body;

    await db.collection('locations').doc(id).update({ name, city });
    res.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete location (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    await db.collection('locations').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
