import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key from file
const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL('./attached_assets/vta-insights-firebase-adminsdk-fbsvc-5e57194cd0_1750485915611.json', import.meta.url),
    'utf8'
  )
);

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();
