import express from 'express';
import { getDb } from '../db-firebase.js';
import admin from 'firebase-admin';

const router = express.Router();

function getDatabase() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Please restart the server.');
  }
  return getDb();
}

// Get social media settings
router.get('/social-media', async (req, res) => {
  try {
    const db = getDatabase();
    const settingsRef = db.collection('settings').doc('social_media');
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      return res.json({
        success: true,
        data: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: '',
          whatsapp: ''
        }
      });
    }

    const data = settingsDoc.data();
    res.json({
      success: true,
      data: {
        facebook: data?.facebook || '',
        twitter: data?.twitter || '',
        instagram: data?.instagram || '',
        linkedin: data?.linkedin || '',
        youtube: data?.youtube || '',
        whatsapp: data?.whatsapp || ''
      }
    });
  } catch (error) {
    console.error('Error fetching social media settings:', error);
    res.json({
      success: true,
      data: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        whatsapp: ''
      }
    });
  }
});

export default router;
