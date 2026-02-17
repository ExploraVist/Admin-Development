import { useMemo, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useFirestoreQuery, useFirestoreDoc } from './useFirestoreQuery';

export function useDevices() {
  const queryRef = useMemo(() => {
    return query(collection(db, 'devices'), orderBy('createdAt', 'desc'));
  }, []);

  return useFirestoreQuery(queryRef);
}

export function useDevice(deviceId) {
  const docRef = useMemo(() => {
    if (!deviceId) return null;
    return doc(db, 'devices', deviceId);
  }, [deviceId]);

  return useFirestoreDoc(docRef, !!deviceId);
}

/**
 * Client-side device minting that replicates Cloud-Development's auth.js algorithm.
 * Uses crypto.getRandomValues() for secure random generation.
 */
export function useMintDevice() {
  const mint = useCallback(async ({ type, name }) => {
    const prefix = type === 'app' ? 'app' : 'hw';
    const idBytes = new Uint8Array(8);
    const secretBytes = new Uint8Array(32);
    crypto.getRandomValues(idBytes);
    crypto.getRandomValues(secretBytes);

    const deviceId = `${prefix}-${Array.from(idBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    const secret = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const now = new Date();
    await setDoc(doc(db, 'devices', deviceId), {
      secret,
      ownerId: 'admin-minted',
      type,
      name,
      createdAt: now,
      lastSeen: now,
    });

    return { deviceId, secret };
  }, []);

  return { mint };
}
