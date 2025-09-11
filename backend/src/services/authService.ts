import admin from 'firebase-admin';
import { User } from '../types';
import * as path from 'path';

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const authService = {
  async verifyToken(idToken: string): Promise<User> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || '',
        createdAt: new Date(decodedToken.iat * 1000)
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};
