import { useState, useEffect, useRef, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';

/**
 * Core Firestore subscription hook with built-in caching and re-render minimization.
 *
 * - Deduplicates identical queries via a global listener cache (keyed by serialized query).
 * - Only triggers a re-render when the snapshot data actually changes (shallow compare of doc IDs + updateTimestamps).
 * - Automatically unsubscribes when the last component using a query unmounts.
 * - Returns a stable reference unless data changes.
 */

// Global cache: queryKey -> { unsubscribe, data, error, refCount, listeners }
const queryCache = new Map();

function serializeQuery(query) {
  // Use Firestore's internal path + filter representation
  try {
    return JSON.stringify({
      path: query?._query?.path?.segments?.join('/') || '',
      filters: query?._query?.filters || [],
      orderBy: query?._query?.orderBy || [],
    });
  } catch {
    // Fallback: use the query reference identity via toString
    return String(query);
  }
}

function snapshotToData(snapshot) {
  if (!snapshot) return [];
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    _updatedAt: doc.data().updatedAt?.seconds || doc.data().createdAt?.seconds || 0,
  }));
}

function dataFingerprint(data) {
  if (!data || data.length === 0) return '';
  return data.map(d => `${d.id}:${d._updatedAt}`).join(',');
}

export function useFirestoreQuery(query, enabled = true) {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  const prevFingerprint = useRef('');
  const queryKey = useMemo(() => query ? serializeQuery(query) : null, [query]);

  useEffect(() => {
    if (!query || !enabled || !queryKey) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    // Check if we already have a cached listener for this query
    let entry = queryCache.get(queryKey);

    if (entry) {
      entry.refCount++;
      // Use cached data immediately to avoid loading flash
      if (entry.data) {
        const fp = dataFingerprint(entry.data);
        if (fp !== prevFingerprint.current) {
          prevFingerprint.current = fp;
          setState({ data: entry.data, loading: false, error: entry.error });
        }
      }
    } else {
      entry = { unsubscribe: null, data: null, error: null, refCount: 1, listeners: new Set() };
      queryCache.set(queryKey, entry);

      entry.unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const newData = snapshotToData(snapshot);
          entry.data = newData;
          entry.error = null;
          // Notify all listeners
          entry.listeners.forEach(fn => fn(newData, null));
        },
        (err) => {
          entry.error = err;
          entry.listeners.forEach(fn => fn(entry.data || [], err));
        }
      );
    }

    const listener = (data, error) => {
      const fp = dataFingerprint(data);
      if (fp !== prevFingerprint.current) {
        prevFingerprint.current = fp;
        setState({ data, loading: false, error });
      } else if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
      } else {
        setState(prev => prev.loading ? { ...prev, loading: false } : prev);
      }
    };

    entry.listeners.add(listener);

    return () => {
      entry.listeners.delete(listener);
      entry.refCount--;
      if (entry.refCount <= 0) {
        entry.unsubscribe?.();
        queryCache.delete(queryKey);
      }
    };
  }, [queryKey, enabled]);

  return state;
}

/**
 * Hook for subscribing to a single Firestore document.
 */
export function useFirestoreDoc(docRef, enabled = true) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const prevData = useRef(null);

  useEffect(() => {
    if (!docRef || !enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const newData = { id: snap.id, ...snap.data() };
          // Only update if data actually changed
          const newJson = JSON.stringify(newData);
          if (newJson !== prevData.current) {
            prevData.current = newJson;
            setState({ data: newData, loading: false, error: null });
          }
        } else {
          if (prevData.current !== null) {
            prevData.current = null;
            setState({ data: null, loading: false, error: null });
          }
        }
      },
      (err) => setState({ data: null, loading: false, error: err })
    );

    return unsub;
  }, [docRef?.path, enabled]);

  return state;
}
