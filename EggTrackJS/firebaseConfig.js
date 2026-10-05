import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  inMemoryPersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBd-J62jHbxqclciJLZK65i5zoqeRaYqYo",
  authDomain: "eggtrack-a01ac.firebaseapp.com",
  projectId: "eggtrack-a01ac",
  storageBucket: "eggtrack-a01ac.firebasestorage.app",
  messagingSenderId: "208669174719",
  appId: "1:208669174719:web:cb40b5c6f62f6c612bcf0a",
};

const app = getApps().find(existingApp => existingApp.name === '[DEFAULT]')
  || initializeApp(firebaseConfig);

export const db = getFirestore(app);

const getOrInitializeAuth = (authApp, persistence) => {
  try {
    return initializeAuth(authApp, { persistence });
  } catch (error) {
    if (error?.code === 'auth/already-initialized') return getAuth(authApp);
    throw error;
  }
};

export const auth = getOrInitializeAuth(
  app,
  getReactNativePersistence(AsyncStorage)
);

// A secondary, in-memory Auth instance creates staff logins without signing
// the Owner out of the primary app session. It requires no server functions.
const staffProvisioningApp = getApps().find(existingApp => existingApp.name === 'EggTrackStaffProvisioning')
  || initializeApp(firebaseConfig, 'EggTrackStaffProvisioning');
export const staffProvisioningAuth = getOrInitializeAuth(
  staffProvisioningApp,
  inMemoryPersistence
);

export default app;
