import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '../db-firebase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Admin login with username/password
router.post('/login', async (req, res) => {
  try {
    const { username, password, idToken } = req.body;

    // Support both Firebase Auth token and username/password
    if (idToken) {
      // Firebase Auth login (if implemented)
      return res.status(400).json({
        success: false,
        error: 'Firebase Auth login not implemented',
        message: 'Please use username/password login'
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    const db = getDb();
    const adminSnapshot = await db.collection('admin_users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    const adminUser = adminSnapshot.docs[0].data();
    const isValidPassword = await bcrypt.compare(password, adminUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminSnapshot.docs[0].id,
        username: adminUser.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: adminSnapshot.docs[0].id,
        username: adminUser.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Test route
router.get('/test-route', (req, res) => {
  res.json({ 
    message: 'Auth route is working!',
    timestamp: new Date().toISOString()
  });
});

export default router;
