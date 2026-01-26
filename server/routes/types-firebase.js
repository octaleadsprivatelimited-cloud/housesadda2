import express from 'express';
import { db } from '../db-firebase.js';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all property types
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('property_types')
      .orderBy('name')
      .get();

    const types = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(types);
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property type (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property type (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await db.collection('property_types').doc(id).update({
      name
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property type (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.collection('property_types').doc(id).delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
