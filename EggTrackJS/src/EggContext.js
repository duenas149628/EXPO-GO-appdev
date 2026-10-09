import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
  increment,
  where,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

export const EggContext = createContext(null);

const STORAGE_KEY = '@eggtrack_data';

const DEFAULT_INVENTORY = {
  pullet: 20,
  small: 35,
  medium: 80,
  large: 70,
  xlarge: 30,
  jumbo: 10,
};

const DEFAULT_THRESHOLDS = {
  pullet: 10,
  small: 15,
  medium: 20,
  large: 20,
  xlarge: 10,
  jumbo: 10,
};

const DEFAULT_SALE_PRICES = {
  perEgg: { pullet: 5, small: 6, medium: 7, large: 8, xlarge: 9, jumbo: 10 },
  perTray: { pullet: 150, small: 165, medium: 185, large: 205, xlarge: 225, jumbo: 240 },
};

const EGG_FIELDS = ['pullet', 'small', 'medium', 'large', 'xlarge', 'jumbo'];

const commitInventoryOperation = async (businessId, operation) => {
  const inventoryRef = doc(db, 'businesses', businessId, 'inventory', 'main');
  const collectionName = operation.kind === 'sale' ? 'sales' : 'productions';
  const recordRef = doc(db, collectionName, operation.documentId);

  const direction = operation.kind === 'sale' ? -1 : 1;
  const inventoryUpdates = Object.fromEntries(
    EGG_FIELDS.map(key => [key, increment(direction * (Number(operation.record[key]) || 0))])
  );
  const batch = writeBatch(db);
  batch.update(inventoryRef, {
    ...inventoryUpdates,
    updatedAt: Date.now(),
    updatedBy: operation.record.recordedBy,
    updatedByEmail: operation.record.recordedByEmail,
  });
  batch.set(recordRef, operation.record);
  await batch.commit();
};

export default function EggProvider({
  children,
  user,
  role,
  businessId,
}) {
  const [inventory, setInventory] = useState(
    DEFAULT_INVENTORY
  );

  const [sales, setSales] = useState([]);

  const [productions, setProductions] = useState([]);
  const [pendingOperations, setPendingOperations] = useState([]);
  const pendingOperationsRef = useRef([]);
  const cloudInventoryRef = useRef(null);
  const confirmedRecordIdsRef = useRef(new Set());
  const cloudQueryReadyRef = useRef({ sales: false, productions: false });
  const syncInProgressRef = useRef(false);
  const [isOnline, setIsOnline] = useState(null);
  const [cloudQueriesReady, setCloudQueriesReady] = useState(false);

  const [thresholds, setThresholds] = useState(
    DEFAULT_THRESHOLDS
  );
  const [salePrices, setSalePrices] = useState(DEFAULT_SALE_PRICES);

  const [isLoading, setIsLoading] = useState(true);
  const storageKey = user?.uid
    ? `${STORAGE_KEY}:${user.uid}`
    : `${STORAGE_KEY}:guest`;
  const [loadedStorageKey, setLoadedStorageKey] = useState(null);
  const pendingStorageKey = `${storageKey}:pending-operations`;

  const persistPendingOperations = useCallback(async (nextOperations, notify = true) => {
    await AsyncStorage.setItem(pendingStorageKey, JSON.stringify(nextOperations));
    pendingOperationsRef.current = nextOperations;
    if (notify) setPendingOperations(nextOperations);
  }, [pendingStorageKey]);

  const reconcileCloudInventory = useCallback(() => {
    if (!cloudInventoryRef.current) return;
    const inventoryWithPending = { ...cloudInventoryRef.current };
    pendingOperationsRef.current.forEach(operation => {
      if (confirmedRecordIdsRef.current.has(`${operation.kind}:${operation.documentId}`)) return;
      const direction = operation.kind === 'sale' ? -1 : 1;
      EGG_FIELDS.forEach(key => {
        inventoryWithPending[key] += direction * (Number(operation.record[key]) || 0);
      });
    });
    setInventory(inventoryWithPending);
  }, []);


  // =====================================================
  // LOAD LOCAL ASYNCSTORAGE DATA
  // =====================================================

  useEffect(() => {
    let isCurrent = true;
    setSalePrices(DEFAULT_SALE_PRICES);

    const loadLocalData = async () => {
      try {
        const savedData =
          await AsyncStorage.getItem(storageKey);
        const savedOperations = await AsyncStorage.getItem(pendingStorageKey);
        const restoredOperations = savedOperations
          ? JSON.parse(savedOperations).map(operation => ({ ...operation, fresh: false }))
          : [];
        pendingOperationsRef.current = restoredOperations;
        setPendingOperations(restoredOperations);

        if (savedData && isCurrent) {
          const data = JSON.parse(savedData);
          const restoredInventory = { ...(data.inventory || DEFAULT_INVENTORY) };
          const restoredSales = [...(data.sales || [])];
          const restoredProductions = [...(data.productions || [])];
          restoredOperations.forEach(operation => {
            const collection = operation.kind === 'sale' ? restoredSales : restoredProductions;
            const hasCachedRecord = collection.some(record => record.firebaseId === operation.documentId);
            if (hasCachedRecord) return;
            collection.unshift({ ...operation.record, firebaseId: operation.documentId, pendingSync: true });
            const direction = operation.kind === 'sale' ? -1 : 1;
            EGG_FIELDS.forEach(key => {
              restoredInventory[key] = Number(restoredInventory[key] || 0)
                + direction * (Number(operation.record[key]) || 0);
            });
          });
          setInventory(restoredInventory);
          setSales(restoredSales);
          setProductions(restoredProductions);
          setThresholds(data.thresholds || DEFAULT_THRESHOLDS);
        } else if (isCurrent) {
          const restoredInventory = { ...DEFAULT_INVENTORY };
          const restoredSales = [];
          const restoredProductions = [];
          restoredOperations.forEach(operation => {
            (operation.kind === 'sale' ? restoredSales : restoredProductions)
              .push({ ...operation.record, firebaseId: operation.documentId, pendingSync: true });
            const direction = operation.kind === 'sale' ? -1 : 1;
            EGG_FIELDS.forEach(key => {
              restoredInventory[key] += direction * (Number(operation.record[key]) || 0);
            });
          });
          setInventory(restoredInventory);
          setSales(restoredSales);
          setProductions(restoredProductions);
          setThresholds(DEFAULT_THRESHOLDS);
        }
      } catch (error) {
        console.log(
          'Error loading local EggTrack data:',
          error
        );
        if (isCurrent) {
          setInventory(DEFAULT_INVENTORY);
          setSales([]);
          setProductions([]);
          setThresholds(DEFAULT_THRESHOLDS);
        }
      } finally {
        if (isCurrent) {
          setLoadedStorageKey(storageKey);
          setIsLoading(false);
        }
      }
    };

    loadLocalData();
    return () => {
      isCurrent = false;
    };
  }, [storageKey, pendingStorageKey]);


  // Track reachability so writes can be saved locally without waiting for a
  // Firestore batch promise that cannot finish while the device is offline.
  useEffect(() => NetInfo.addEventListener(state => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    setIsOnline(online);
    if (!online) {
      cloudQueryReadyRef.current = { sales: false, productions: false };
      setCloudQueriesReady(false);
    }
  }), []);


  // Replay the durable local outbox in order when connectivity returns.
  useEffect(() => {
    if (!isOnline || !user || !businessId || pendingOperations.length === 0 || syncInProgressRef.current) {
      return;
    }

    const syncPendingOperations = async () => {
      syncInProgressRef.current = true;
      try {
        for (const operation of pendingOperationsRef.current) {
          if (operation.blocked) continue;
          if (!operation.fresh && !cloudQueriesReady) break;

          try {
            if (!confirmedRecordIdsRef.current.has(`${operation.kind}:${operation.documentId}`)) {
              await commitInventoryOperation(businessId, operation);
            }
            const remaining = pendingOperationsRef.current.filter(item => item.id !== operation.id);
            await persistPendingOperations(remaining);
            const markSynced = record => record.firebaseId === operation.documentId
              ? { ...record, pendingSync: false }
              : record;
            if (operation.kind === 'sale') setSales(previous => previous.map(markSynced));
            else setProductions(previous => previous.map(markSynced));
          } catch (error) {
            const isConnectivityError = ['unavailable', 'deadline-exceeded', 'network-request-failed'].some(
              code => error?.code?.includes(code)
            );
            if (isConnectivityError) break;

            const updated = pendingOperationsRef.current.map(item => item.id === operation.id
              ? { ...item, blocked: true, errorCode: error?.code || 'sync-failed' }
              : item);
            await persistPendingOperations(updated);
            const updateError = record => record.firebaseId === operation.documentId
              ? { ...record, pendingSync: true, pendingSyncError: error?.code || 'sync-failed' }
              : record;
            if (operation.kind === 'sale') setSales(previous => previous.map(updateError));
            else setProductions(previous => previous.map(updateError));
            console.log('Offline operation needs attention:', error?.code, error?.message);
          }
        }
      } catch (error) {
        console.log('Could not update the offline queue:', error?.message || error);
      } finally {
        syncInProgressRef.current = false;
      }
    };

    syncPendingOperations();
  }, [isOnline, cloudQueriesReady, user, businessId, pendingOperations.length, persistPendingOperations]);


  // =====================================================
  // SAVE LOCAL ASYNCSTORAGE DATA
  // =====================================================

  useEffect(() => {
    if (isLoading || loadedStorageKey !== storageKey) {
      return;
    }

    const saveTimer = setTimeout(async () => {
      try {
        const data = {
          inventory,
          sales,
          productions,
          thresholds,
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.log('Error saving local EggTrack data:', error);
      }
    }, 350);

    return () => clearTimeout(saveTimer);
  }, [
    inventory,
    sales,
    productions,
    thresholds,
    isLoading,
    loadedStorageKey,
    storageKey,
  ]);


  // =====================================================
  // REAL-TIME FIREBASE LISTENERS
  // =====================================================

  useEffect(() => {
    if (!user || !businessId || loadedStorageKey !== storageKey) {
      return;
    }

    cloudQueryReadyRef.current = { sales: false, productions: false };
    confirmedRecordIdsRef.current = new Set();
    setCloudQueriesReady(false);

    // ===================================================
    // INVENTORY LISTENER
    // ===================================================

    const unsubscribeInventory =
      onSnapshot(
        doc(db, 'businesses', businessId, 'inventory', 'main'),

        snapshot => {
          if (snapshot.metadata.fromCache) return;
          if (!snapshot.exists()) {
            console.log(
              'inventory/main does not exist.'
            );

            return;
          }

          const data = snapshot.data();

          const cloudInventory = {
            pullet: Number(data.pullet || 0),
            small: Number(data.small || 0),
            medium: Number(data.medium || 0),
            large: Number(data.large || 0),
            xlarge: Number(data.xlarge || 0),
            jumbo: Number(data.jumbo || 0),
          };

          cloudInventoryRef.current = cloudInventory;
          reconcileCloudInventory();

        },

        error => {
          console.log(
            'Inventory listener error:',
            error
          );
        }
      );


    // ===================================================
    // SETTINGS LISTENER
    // ===================================================

    const unsubscribeSettings =
      onSnapshot(
        doc(db, 'businesses', businessId, 'settings', 'main'),

        snapshot => {
          if (!snapshot.exists()) {
            console.log(
              'settings/main does not exist. Using default thresholds.'
            );
            setSalePrices(DEFAULT_SALE_PRICES);

            return;
          }

          const data = snapshot.data();
          setSalePrices({
            perEgg: Object.fromEntries(EGG_FIELDS.map(key => [
              key,
              Number(data.salePrices?.perEgg?.[key] ?? DEFAULT_SALE_PRICES.perEgg[key]),
            ])),
            perTray: Object.fromEntries(EGG_FIELDS.map(key => [
              key,
              Number(data.salePrices?.perTray?.[key] ?? DEFAULT_SALE_PRICES.perTray[key]),
            ])),
          });

          if (data.thresholds) {
            setThresholds({
              pullet: Number(
                data.thresholds.pullet ??
                DEFAULT_THRESHOLDS.pullet
              ),

              small: Number(
                data.thresholds.small ??
                DEFAULT_THRESHOLDS.small
              ),

              medium: Number(
                data.thresholds.medium ??
                DEFAULT_THRESHOLDS.medium
              ),

              large: Number(
                data.thresholds.large ??
                DEFAULT_THRESHOLDS.large
              ),

              xlarge: Number(
                data.thresholds.xlarge ??
                DEFAULT_THRESHOLDS.xlarge
              ),

              jumbo: Number(
                data.thresholds.jumbo ??
                DEFAULT_THRESHOLDS.jumbo
              ),
            });
          }

        },

        error => {
          console.log(
            'Settings listener error:',
            error
          );
        }
      );


    // ===================================================
    // PRODUCTION LISTENER
    // ===================================================

    const unsubscribeProductions =
      onSnapshot(
        query(collection(db, 'productions'), where('businessId', '==', businessId)),

        { includeMetadataChanges: true },

        snapshot => {
          const cloudProductions =
            snapshot.docs.map(
              productionDoc => ({
                ...productionDoc.data(),
                firebaseId: productionDoc.id,
              })
            );

          cloudProductions.sort(
            (a, b) =>
              `${b.date || ''}-${b.id || ''}`.localeCompare(
                `${a.date || ''}-${a.id || ''}`
              )
          );

          const cloudIds = new Set(cloudProductions.map(record => record.firebaseId));
          confirmedRecordIdsRef.current = new Set([
            ...[...confirmedRecordIdsRef.current].filter(id => !id.startsWith('production:')),
            ...[...cloudIds].map(id => `production:${id}`),
          ]);
          if (!snapshot.metadata.fromCache) {
            cloudQueryReadyRef.current.productions = true;
            setCloudQueriesReady(cloudQueryReadyRef.current.sales);
          }
          const queuedProductions = pendingOperationsRef.current
            .filter(operation => operation.kind === 'production' && !cloudIds.has(operation.documentId))
            .map(operation => ({ ...operation.record, firebaseId: operation.documentId, pendingSync: true, pendingSyncError: operation.errorCode }));
          setProductions([...queuedProductions, ...cloudProductions]);
          reconcileCloudInventory();


        },

        error => {
          console.log(
            'Production listener error:',
            error
          );
        }
      );


    // ===================================================
    // SALES LISTENER
    // ===================================================

    const unsubscribeSales =
      onSnapshot(
        query(collection(db, 'sales'), where('businessId', '==', businessId)),

        { includeMetadataChanges: true },

        snapshot => {
          const cloudSales =
            snapshot.docs.map(
              saleDoc => ({
                ...saleDoc.data(),

                firebaseId:
                  saleDoc.id,
              })
            );


          cloudSales.sort(
            (a, b) =>
              Number(b.id || 0) -
              Number(a.id || 0)
          );


          const cloudIds = new Set(cloudSales.map(record => record.firebaseId));
          confirmedRecordIdsRef.current = new Set([
            ...[...confirmedRecordIdsRef.current].filter(id => !id.startsWith('sale:')),
            ...[...cloudIds].map(id => `sale:${id}`),
          ]);
          if (!snapshot.metadata.fromCache) {
            cloudQueryReadyRef.current.sales = true;
            setCloudQueriesReady(cloudQueryReadyRef.current.productions);
          }
          const queuedSales = pendingOperationsRef.current
            .filter(operation => operation.kind === 'sale' && !cloudIds.has(operation.documentId))
            .map(operation => ({ ...operation.record, firebaseId: operation.documentId, pendingSync: true, pendingSyncError: operation.errorCode }));
          setSales([...queuedSales, ...cloudSales]);
          reconcileCloudInventory();


        },

        error => {
          console.log(
            'Sales listener error:',
            error
          );
        }
      );


    // ===================================================
    // CLEAN UP LISTENERS
    // ===================================================

    return () => {
      unsubscribeInventory();
      unsubscribeSettings();
      unsubscribeProductions();
      unsubscribeSales();
    };

  }, [user, businessId, loadedStorageKey, storageKey, reconcileCloudInventory]);


  // =====================================================
  // ADD PRODUCTION
  // =====================================================

  const addProduction = async (
    production
  ) => {
    const values = Object.fromEntries(
      EGG_FIELDS.map(key => [key, Number(production[key]) || 0])
    );
    const totalEggs = EGG_FIELDS.reduce((sum, key) => sum + values[key], 0);
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const record = {
      ...values,
      id: Date.now(),
      date,
      totalEggs,
      recordedBy: user?.uid || null,
      recordedByEmail: user?.email || null,
      businessId: businessId || null,
    };

    if (user) {
      try {
        if (!businessId) return false;
        const productionRef = doc(collection(db, 'productions'));
        const operation = {
          id: `production-${productionRef.id}`,
          kind: 'production',
          documentId: productionRef.id,
          fresh: true,
          record,
        };
        await persistPendingOperations([...pendingOperationsRef.current, operation]);
        setInventory(previous => Object.fromEntries(
          EGG_FIELDS.map(key => [key, Number(previous[key]) + values[key]])
        ));
        setProductions(previous => [{ ...record, firebaseId: productionRef.id, pendingSync: true }, ...previous]);
        return true;
      } catch (error) {
        console.log('Production save failed:', error);
        return false;
      }
    }

    // Local-only operation for unauthenticated development; it is not queued for cloud sync.
    setInventory(previous => Object.fromEntries(EGG_FIELDS.map(key => [key, Number(previous[key]) + values[key]])));
    setProductions(previous => [{ ...record, firebaseId: `local-${record.id}` }, ...previous]);
    return true;
  };


  // =====================================================
  // SELL EGGS
  // =====================================================

  const addSale = async (
    sale
  ) => {
    const saleRecord = {
      ...sale,
      recordedBy: user?.uid || null,
      recordedByEmail: user?.email || null,
      businessId: businessId || null,
    };

    if (user) {
      try {
        if (!businessId) return { ok: false, code: 'missing-business-link' };
        const saleRef = doc(collection(db, 'sales'));
        const operation = {
          id: `sale-${saleRef.id}`,
          kind: 'sale',
          documentId: saleRef.id,
          fresh: true,
          record: saleRecord,
        };
        const queuedOperations = [...pendingOperationsRef.current, operation];
        await persistPendingOperations(queuedOperations, false);
        setInventory(previous => Object.fromEntries(
          EGG_FIELDS.map(key => [key, Number(previous[key]) - (Number(saleRecord[key]) || 0)])
        ));
        setSales(previous => [{ ...saleRecord, firebaseId: saleRef.id, pendingSync: true }, ...previous]);

        let syncError = null;
        if (isOnline && !syncInProgressRef.current) {
          syncInProgressRef.current = true;
          try {
            await commitInventoryOperation(businessId, operation);
            await persistPendingOperations(
              pendingOperationsRef.current.filter(item => item.id !== operation.id),
              false
            );
            setSales(previous => previous.map(record => record.firebaseId === saleRef.id
              ? { ...record, pendingSync: false }
              : record));
          } catch (error) {
            syncError = error;
            if (!['unavailable', 'deadline-exceeded', 'network-request-failed'].some(code => error?.code?.includes(code))) {
              await persistPendingOperations(pendingOperationsRef.current.map(item => item.id === operation.id
                ? { ...item, fresh: false, blocked: true, errorCode: error?.code || 'sync-failed' }
                : item), false);
              setSales(previous => previous.map(record => record.firebaseId === saleRef.id
                ? { ...record, pendingSyncError: error?.code || 'sync-failed' }
                : record));
            }
          } finally {
            syncInProgressRef.current = false;
          }
        }

        setPendingOperations(pendingOperationsRef.current);
        const stillQueued = pendingOperationsRef.current.some(item => item.id === operation.id);
        return { ok: true, queued: stillQueued, syncError: syncError?.code || null };
      } catch (error) {
        console.log('Sale save failed:', {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
        });
        return {
          ok: false,
          code: error?.code || 'unknown',
          message: error?.message || 'Unknown Firestore error',
        };
      }
    }

    const current = inventory;
    const updated = Object.fromEntries(EGG_FIELDS.map(key => [key, Number(current[key]) || 0]));
    for (const key of EGG_FIELDS) {
      const sold = Number(saleRecord[key]) || 0;
      if (sold > updated[key]) return { ok: false, code: 'insufficient-inventory' };
      updated[key] -= sold;
    }
    setInventory(updated);
    setSales(previous => [{ ...saleRecord, firebaseId: `local-${saleRecord.id}` }, ...previous]);
    return { ok: true };
  };


  // =====================================================
  // UPDATE ALL THRESHOLDS
  // =====================================================

  const updateThresholds = async (
    newThresholds
  ) => {

    if (role !== 'owner') {
      console.log(
        'Only the owner can update thresholds.'
      );

      return false;
    }


    const updatedThresholds = {
      pullet: Number(
        newThresholds.pullet
      ),

      small: Number(
        newThresholds.small
      ),

      medium: Number(
        newThresholds.medium
      ),

      large: Number(
        newThresholds.large
      ),

      xlarge: Number(
        newThresholds.xlarge
      ),

      jumbo: Number(
        newThresholds.jumbo
      ),
    };


    try {

      if (user) {
        await setDoc(
          doc(db, 'businesses', businessId, 'settings', 'main'),

          {
            thresholds:
              updatedThresholds,

            updatedAt:
              Date.now(),

            updatedBy:
              user.uid,

            updatedByEmail:
              user.email,
          },

          {
            merge: true,
          }
        );

        console.log(
          'All thresholds saved to Firebase.'
        );
      }


      setThresholds(
        updatedThresholds
      );


      return true;

    } catch (error) {
      console.log(
        'Error saving thresholds:',
        error
      );

      return false;
    }
  };

  const updateSalePrices = async newSalePrices => {
    if (role !== 'owner' || !user || !businessId) return false;
    const isValidGroup = group => EGG_FIELDS.every(key => (
      Number.isFinite(Number(group?.[key])) && Number(group[key]) >= 0
    ));
    if (!isValidGroup(newSalePrices?.perEgg) || !isValidGroup(newSalePrices?.perTray)) return false;

    const updatedSalePrices = {
      perEgg: Object.fromEntries(EGG_FIELDS.map(key => [key, Number(newSalePrices.perEgg[key])])),
      perTray: Object.fromEntries(EGG_FIELDS.map(key => [key, Number(newSalePrices.perTray[key])])),
    };
    try {
      await setDoc(doc(db, 'businesses', businessId, 'settings', 'main'), {
        salePrices: updatedSalePrices,
        updatedAt: Date.now(),
        updatedBy: user.uid,
        updatedByEmail: user.email,
      }, { merge: true });
      setSalePrices(updatedSalePrices);
      return true;
    } catch (error) {
      console.log('Error saving sale price defaults:', error);
      return false;
    }
  };


  // =====================================================
  // BACKWARD-COMPATIBLE SINGLE THRESHOLD UPDATE
  // =====================================================

  const updateThreshold = async (
    size,
    value
  ) => {

    const updatedThresholds = {
      ...thresholds,

      [size]:
        Number(value),
    };


    return updateThresholds(
      updatedThresholds
    );
  };

  const visibleDataReady = loadedStorageKey === storageKey;


  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <EggContext.Provider
      value={{
        user,
        role,
        businessId,
        isOnline,

        inventory: visibleDataReady ? inventory : DEFAULT_INVENTORY,
        sales: visibleDataReady ? sales : [],
        productions: visibleDataReady ? productions : [],
        thresholds: visibleDataReady ? thresholds : DEFAULT_THRESHOLDS,
        salePrices: visibleDataReady ? salePrices : DEFAULT_SALE_PRICES,

        addProduction,
        addSale,

        updateThreshold,
        updateThresholds,
        updateSalePrices,
      }}
    >
      {children}
    </EggContext.Provider>
  );
}
