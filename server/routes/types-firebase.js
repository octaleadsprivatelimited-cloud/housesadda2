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

// Get all property types
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const snapshot = await db.collection('property_types')
      .orderBy('name')
      .get();

    const types = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || ''
    }));

    res.json(types);
  } catch (error) {
    console.error('Get types error:', error);
    if (error.message.includes('not initialized')) {
      return res.status(503).json({
        error: 'Database not available',
        message: error.message
      });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Create property type (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if type already exists
    const existingSnapshot = await db.collection('property_types')
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Property type already exists' });
    }

    const docRef = await db.collection('property_types').add({
      name,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update property type (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name } = req.body;

    await db.collection('property_types').doc(id).update({ name });
    res.json({ success: true });
  } catch (error) {
    console.error('Update type error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete property type (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    await db.collection('property_types').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete type error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
