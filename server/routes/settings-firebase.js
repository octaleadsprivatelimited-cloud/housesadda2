import express from 'express';
import { db } from '../db-firebase.js';

const router = express.Router();

// Get social media settings (public endpoint for header)
router.get('/social-media', async (req, res) => {
  try {
    const settingsRef = db.collection('settings').doc('social_media');
    const settingsDoc = await settingsRef.get();
    
    if (!settingsDoc.exists) {
      // Return default empty values
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
    // Return empty defaults on error so header doesn't break
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
