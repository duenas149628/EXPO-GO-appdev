import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DEFAULT_INVENTORY = {
  pullet: 20, small: 35, medium: 80, large: 70, xlarge: 30, jumbo: 10,
};
const DEFAULT_THRESHOLDS = {
  pullet: 10, small: 15, medium: 20, large: 20, xlarge: 10, jumbo: 10,
};
const MIGRATION_BATCH_SIZE = 450;

const isLegacyOwner = profile => String(profile?.role || '').trim().toLowerCase() === 'owner'
  && !profile.businessId
  && profile.createdFromSignup !== true;

const copyLegacyCollection = async (collectionName, businessId) => {
  const snapshot = await getDocs(query(collection(db, collectionName)));
  for (let offset = 0; offset < snapshot.docs.length; offset += MIGRATION_BATCH_SIZE) {
    const batch = writeBatch(db);
    snapshot.docs.slice(offset, offset + MIGRATION_BATCH_SIZE).forEach(record => {
      batch.update(record.ref, { businessId });
    });
    await batch.commit();
  }
};

export async function initializeBusinessWorkspace(user, businessName) {
  if (!user?.uid) throw new Error('Sign in again before setting up the business.');
  const name = businessName.trim();
  if (!name) throw new Error('Enter the business name to continue.');

  const userRef = doc(db, 'users', user.uid);
  const profileSnapshot = await getDoc(userRef);
  const profile = profileSnapshot.exists() ? profileSnapshot.data() : null;
  const businessId = user.uid;

  if (profile?.businessId) {
    const businessRef = doc(db, 'businesses', profile.businessId);
    const businessSnapshot = await getDoc(businessRef);
    if (businessSnapshot.exists() && businessSnapshot.data().status === 'active') return;
    const migrationRef = doc(db, 'system', 'businessSetup');
    const migrationSnapshot = await getDoc(migrationRef);
    if (migrationSnapshot.exists()
      && migrationSnapshot.data().ownerUid === user.uid
      && migrationSnapshot.data().migrationStatus === 'pending') {
      const [legacyInventory, legacySettings, workspaceInventory, workspaceSettings] = await Promise.all([
        getDoc(doc(db, 'inventory', 'main')),
        getDoc(doc(db, 'settings', 'main')),
        getDoc(doc(db, 'businesses', profile.businessId, 'inventory', 'main')),
        getDoc(doc(db, 'businesses', profile.businessId, 'settings', 'main')),
      ]);
      if (!workspaceInventory.exists() || !workspaceSettings.exists()) {
        const repairBatch = writeBatch(db);
        if (!workspaceInventory.exists()) {
          repairBatch.set(doc(db, 'businesses', profile.businessId, 'inventory', 'main'), {
            ...(legacyInventory.exists() ? legacyInventory.data() : DEFAULT_INVENTORY),
            updatedAt: Date.now(), updatedBy: user.uid,
          });
        }
        if (!workspaceSettings.exists()) {
          repairBatch.set(doc(db, 'businesses', profile.businessId, 'settings', 'main'), {
            thresholds: legacySettings.exists()
              ? legacySettings.data().thresholds || DEFAULT_THRESHOLDS
              : DEFAULT_THRESHOLDS,
            updatedAt: Date.now(), updatedBy: user.uid,
          });
        }
        await repairBatch.commit();
      }
      await copyLegacyCollection('sales', businessId);
      await copyLegacyCollection('productions', businessId);
      const finish = writeBatch(db);
      finish.update(businessRef, { status: 'active' });
      finish.update(migrationRef, { migrationStatus: 'complete' });
      await finish.commit();
      return;
    }
    throw new Error('This business is still being set up. Sign out and back in, or contact the business owner.');
  }

  if (isLegacyOwner(profile)) {
    const inventorySnapshot = await getDoc(doc(db, 'inventory', 'main'));
    const settingsSnapshot = await getDoc(doc(db, 'settings', 'main'));
    const migrationRef = doc(db, 'system', 'businessSetup');
    const businessRef = doc(db, 'businesses', businessId);
    const batch = writeBatch(db);
    batch.set(migrationRef, {
      ownerUid: user.uid,
      businessId,
      migrationStatus: 'pending',
      startedAt: Date.now(),
    });
    batch.set(businessRef, {
      name,
      ownerUid: user.uid,
      status: 'migrating',
      createdAt: Date.now(),
    });
    batch.update(userRef, { businessId });
    await batch.commit();

    const initializeData = writeBatch(db);
    initializeData.set(doc(db, 'businesses', businessId, 'inventory', 'main'), {
      ...(inventorySnapshot.exists() ? inventorySnapshot.data() : DEFAULT_INVENTORY),
      updatedAt: Date.now(), updatedBy: user.uid,
    });
    initializeData.set(doc(db, 'businesses', businessId, 'settings', 'main'), {
      thresholds: settingsSnapshot.exists()
        ? settingsSnapshot.data().thresholds || DEFAULT_THRESHOLDS
        : DEFAULT_THRESHOLDS,
      updatedAt: Date.now(), updatedBy: user.uid,
    });
    await initializeData.commit();

    await copyLegacyCollection('sales', businessId);
    await copyLegacyCollection('productions', businessId);
    const finish = writeBatch(db);
    finish.update(businessRef, { status: 'active' });
    finish.update(migrationRef, { migrationStatus: 'complete' });
    await finish.commit();
    return;
  }

  // New signups create their business and Owner profile atomically. Rules
  // cross-check both documents with getAfter so neither can be forged alone.
  const batch = writeBatch(db);
  batch.set(doc(db, 'businesses', businessId), {
    name,
    ownerUid: user.uid,
    status: 'active',
    createdAt: Date.now(),
  });
  batch.set(userRef, {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role: 'owner',
    businessId,
    createdFromSignup: true,
    createdAt: Date.now(),
  });
  await batch.commit();
  const initialData = writeBatch(db);
  initialData.set(doc(db, 'businesses', businessId, 'inventory', 'main'), DEFAULT_INVENTORY);
  initialData.set(doc(db, 'businesses', businessId, 'settings', 'main'), {
    thresholds: DEFAULT_THRESHOLDS,
  });
  await initialData.commit();
}
