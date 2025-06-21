import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adminDb: any = null;

try {
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    // Initialize Firebase Admin SDK if not already initialized
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccountPath),
      });
    }
    adminDb = getFirestore();
    console.log("Firebase Admin SDK initialized successfully with service account file");
  } else {
    console.warn("Firebase service account file not found, using memory storage");
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization failed, using memory storage:', error);
}

export { adminDb };