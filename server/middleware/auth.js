import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Try to verify as Firebase Auth ID token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await admin.auth().getUser(decodedToken.uid);
      
      req.user = {
        uid: user.uid,
        id: user.uid, // For backward compatibility
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        firebaseAuth: true
      };
      return next();
    } catch (firebaseError) {
      // If Firebase Auth verification fails, try custom JWT
      jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        async (err, decoded) => {
          if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
          }

          // If it's a Firebase Auth user (has uid), get user details
          if (decoded.uid) {
            try {
              const user = await admin.auth().getUser(decoded.uid);
              req.user = {
                uid: user.uid,
                id: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                firebaseAuth: true
              };
            } catch (error) {
              return res.status(403).json({ error: 'User not found in Firebase Auth' });
            }
          } else {
            // Legacy support for old format
            req.user = decoded;
          }
          
          next();
        }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

