import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Test route to verify this router is being used
router.get('/test-route', (req, res) => {
  res.json({ 
    message: 'Firebase auth route is active!',
    route: 'auth-firebase.js',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/auth/login
 * 
 * Authenticates a user using Firebase Auth ID token.
 * Frontend should authenticate with Firebase Auth client SDK first,
 * then send the ID token to this endpoint.
 * 
 * Request Body:
 *   - idToken: string (required) - Firebase Auth ID token
 * 
 * Response Codes:
 *   - 200: Login successful
 *   - 400: Missing or invalid request body/idToken
 *   - 401: Invalid or expired token
 *   - 403: Account disabled
 *   - 503: Server configuration issue (Firebase Admin not configured)
 *   - 500: Internal server error
 */
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Log incoming request
    console.log('\n🔐 ========== LOGIN REQUEST ==========');
    console.log('📥 Request received:', {
      method: req.method,
      url: req.url,
      path: req.path,
      timestamp: new Date().toISOString(),
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    // ========== VALIDATE REQUEST BODY ==========
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Validation failed: Invalid request body');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request',
        message: 'Request body is required and must be a JSON object',
        code: 'INVALID_REQUEST_BODY'
      });
    }

    const { idToken, email, password } = req.body;

    // ========== VALIDATE ID TOKEN PRESENCE ==========
    if (!idToken) {
      console.error('❌ Validation failed: Missing idToken');
      console.error('   Received body keys:', Object.keys(req.body));
      return res.status(400).json({ 
        success: false,
        error: 'Missing authentication token',
        message: 'idToken is required. Please authenticate with Firebase Auth first.',
        code: 'ID_TOKEN_REQUIRED',
        received: {
          bodyKeys: Object.keys(req.body),
          hasEmail: !!email,
          hasPassword: !!password
        }
      });
    }

    // ========== VALIDATE ID TOKEN FORMAT ==========
    if (typeof idToken !== 'string' || idToken.trim().length === 0) {
      console.error('❌ Validation failed: Invalid idToken format');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid authentication token',
        message: 'idToken must be a non-empty string',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    console.log('✅ Request validation passed');
    console.log('   idToken length:', idToken.length);
    console.log('   idToken preview:', idToken.substring(0, 20) + '...');

    // ========== CHECK FIREBASE ADMIN INITIALIZATION ==========
    // Ensure Firebase Admin SDK is initialized
    try {
      if (!admin.apps.length) {
        // Try to initialize if not already initialized
        await import('../db-firebase.js');
        
        // Check again after import
        if (!admin.apps.length) {
          console.error('❌ Firebase Admin SDK not initialized');
          console.error('   This is a configuration issue, not a server error');
          console.error('   Check FIREBASE_SERVICE_ACCOUNT_PATH in .env file');
          return res.status(503).json({ 
            success: false,
            error: 'Service unavailable',
            message: 'Authentication service is not properly configured. Please contact administrator.',
            code: 'SERVICE_NOT_CONFIGURED',
            instructions: 'The server needs Firebase Admin SDK credentials to verify tokens. See SETUP_FIREBASE_CREDENTIALS.md'
          });
        }
      }
      console.log('✅ Firebase Admin SDK is initialized');
    } catch (initError) {
      console.error('❌ Firebase Admin SDK initialization check failed:', initError);
      console.error('   Error details:', initError.message);
      return res.status(503).json({ 
        success: false,
        error: 'Service unavailable',
        message: 'Authentication service configuration error. Please contact administrator.',
        code: 'SERVICE_NOT_CONFIGURED',
        details: process.env.NODE_ENV === 'development' ? initError.message : undefined
      });
    }

    // ========== VERIFY FIREBASE ID TOKEN ==========
    let decodedToken;
    let user;
    
    try {
      console.log('🔍 Verifying Firebase ID token...');
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token verified successfully');
      console.log('   User ID:', decodedToken.uid);
      console.log('   Email:', decodedToken.email);
      
      // Get full user details
      console.log('🔍 Fetching user details...');
      user = await admin.auth().getUser(decodedToken.uid);
      console.log('✅ User details retrieved');
      
      // Check if user is disabled
      if (user.disabled) {
        console.warn('⚠️  Login blocked: Account is disabled');
        return res.status(403).json({ 
          success: false,
          error: 'Account disabled',
          message: 'This account has been disabled. Please contact support.',
          code: 'ACCOUNT_DISABLED'
        });
      }
      
    } catch (firebaseError) {
      // Handle Firebase Auth verification errors
      console.error('❌ Firebase Auth verification failed');
      console.error('   Error code:', firebaseError.code);
      console.error('   Error message:', firebaseError.message);
      
      // Check for configuration/credential errors
      const isConfigError = firebaseError.message && (
        firebaseError.message.includes('credential') ||
        firebaseError.message.includes('Credential') ||
        firebaseError.message.includes('PERMISSION_DENIED') ||
        firebaseError.message.includes('Could not load') ||
        firebaseError.message.includes('Service account') ||
        firebaseError.code === 'PERMISSION_DENIED'
      );
      
      if (isConfigError) {
        console.error('   This is a configuration issue');
        return res.status(503).json({ 
          success: false,
          error: 'Service unavailable',
          message: 'Authentication service configuration error. Please contact administrator.',
          code: 'CONFIGURATION_ERROR',
          instructions: {
            step1: 'Download service account key from Firebase Console',
            step2: 'Save as serviceAccountKey.json in project root',
            step3: 'Add FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json to .env',
            step4: 'Restart the server'
          },
          details: process.env.NODE_ENV === 'development' ? firebaseError.message : undefined
        });
      }
      
      // Handle token-specific errors
      let statusCode = 401;
      let errorMessage = 'Authentication failed';
      let errorCode = 'AUTH_FAILED';
      
      if (firebaseError.code === 'auth/id-token-expired') {
        errorMessage = 'Authentication token has expired. Please sign in again.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (firebaseError.code === 'auth/id-token-revoked') {
        errorMessage = 'Authentication token has been revoked. Please sign in again.';
        errorCode = 'TOKEN_REVOKED';
      } else if (firebaseError.code === 'auth/argument-error') {
        errorMessage = 'Invalid authentication token format.';
        errorCode = 'INVALID_TOKEN';
      } else if (firebaseError.code === 'auth/user-disabled') {
        statusCode = 403;
        errorMessage = 'This account has been disabled.';
        errorCode = 'ACCOUNT_DISABLED';
      } else {
        errorMessage = firebaseError.message || 'Authentication failed. Please try again.';
      }
      
      return res.status(statusCode).json({ 
        success: false,
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? firebaseError.message : undefined
      });
    }

    // ========== GENERATE SESSION TOKEN ==========
    let sessionToken;
    try {
      console.log('🔐 Generating session token...');
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      
      if (jwtSecret === 'your-secret-key-change-in-production') {
        console.warn('⚠️  Using default JWT_SECRET. Set a secure secret in production!');
      }
      
      sessionToken = jwt.sign(
        { 
          uid: user.uid, 
          email: user.email,
          firebaseAuth: true,
          iat: Math.floor(Date.now() / 1000)
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      console.log('✅ Session token generated');
    } catch (jwtError) {
      console.error('❌ Failed to generate session token:', jwtError);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create session. Please try again.',
        code: 'SESSION_CREATION_FAILED'
      });
    }

    // ========== SUCCESS RESPONSE ==========
    const responseTime = Date.now() - startTime;
    console.log('✅ Login successful');
    console.log('   User:', user.email);
    console.log('   Response time:', responseTime + 'ms');
    console.log('========================================\n');
    
    return res.status(200).json({
      success: true,
      token: sessionToken,
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        emailVerified: user.emailVerified || false
      }
    });
    
  } catch (error) {
    // Catch any unexpected errors
    const responseTime = Date.now() - startTime;
    console.error('❌ ========== UNEXPECTED ERROR ==========');
    console.error('   Error:', error);
    console.error('   Stack:', error.stack);
    console.error('   Response time:', responseTime + 'ms');
    console.error('========================================\n');
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify token (supports both Firebase Auth ID token and custom JWT)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Try to verify as Firebase Auth ID token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await admin.auth().getUser(decodedToken.uid);
      
      return res.json({ 
        success: true, 
        user: { 
          id: user.uid, 
          email: user.email,
          displayName: user.displayName || user.email,
          emailVerified: user.emailVerified
        } 
      });
    } catch (firebaseError) {
      // If Firebase Auth verification fails, try custom JWT
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );

        // If it's a Firebase Auth user (has uid), verify with Firebase Auth
        if (decoded.uid) {
          const user = await admin.auth().getUser(decoded.uid);
          return res.json({ 
            success: true, 
            user: { 
              id: user.uid, 
              email: user.email,
              displayName: user.displayName || user.email,
              emailVerified: user.emailVerified
            } 
          });
        }

        // Legacy support for old format
        return res.json({ 
          success: true, 
          user: { 
            id: decoded.id || decoded.uid, 
            email: decoded.email,
            username: decoded.username
          } 
        });
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// List Firebase Auth users (for debugging)
router.get('/list-users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(10);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime
    }));

    res.json({
      success: true,
      count: users.length,
      users: users,
      message: 'Firebase Auth users retrieved successfully'
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update user profile (protected - uses Firebase Auth)
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, email } = req.body;
    const userId = req.user.uid || req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData = {};

    if (displayName) {
      updateData.displayName = displayName;
    }

    if (email && email !== req.user.email) {
      updateData.email = email;
      updateData.emailVerified = false; // Email needs to be verified again
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update user in Firebase Auth
    await admin.auth().updateUser(userId, updateData);

    // Get updated user
    const updatedUser = await admin.auth().getUser(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        emailVerified: updatedUser.emailVerified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
