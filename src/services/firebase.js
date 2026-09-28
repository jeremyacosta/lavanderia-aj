import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';

// Obtiene la configuración desde localStorage o desde variables de entorno VITE
export function getFirebaseConfig() {
  const localSaved = localStorage.getItem('aj_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {
      console.warn('Error al leer configuración local de Firebase:', e);
    }
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

// Inicializa o reutiliza la instancia de Firebase
let dbInstance = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!config) {
    return { isConfigured: false, db: null };
  }

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return { isConfigured: true, db: dbInstance };
  } catch (err) {
    console.error('[Firebase Init Error]:', err);
    return { isConfigured: false, error: err, db: null };
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;
  const { db } = initFirebase();
  return db;
}

// Guarda un documento en Firestore (Upsert)
export async function syncDocToCloud(collectionName, docId, data) {
  const db = getDb();
  if (!db || !docId) return false;
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, collectionName, String(docId)), cleanData, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase Write Error ${collectionName}/${docId}]:`, err);
    return false;
  }
}

// Elimina un documento en Firestore
export async function deleteDocFromCloud(collectionName, docId) {
  const db = getDb();
  if (!db || !docId) return false;
  try {
    await deleteDoc(doc(db, collectionName, String(docId)));
    return true;
  } catch (err) {
    console.error(`[Firebase Delete Error ${collectionName}/${docId}]:`, err);
    return false;
  }
}

// Suscribe en tiempo real a una colección
export function subscribeToCollection(collectionName, onDataReceived) {
  const db = getDb();
  if (!db) return () => {};
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      onDataReceived(items);
    }, (error) => {
      console.warn(`[Firebase Realtime Error ${collectionName}]:`, error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn(`[Firebase Subscribe Error ${collectionName}]:`, err);
    return () => {};
  }
}
