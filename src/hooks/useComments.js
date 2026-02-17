import { useMemo, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useFirestoreQuery } from './useFirestoreQuery';
import { useAuth } from './useAuth';

export function useComments(taskId) {
  const { user, adminUser } = useAuth();

  const queryRef = useMemo(() => {
    if (!taskId) return null;
    return query(
      collection(db, 'tasks', taskId, 'comments'),
      orderBy('createdAt', 'asc')
    );
  }, [taskId]);

  const { data: comments, loading, error } = useFirestoreQuery(queryRef, !!taskId);

  const addComment = useCallback(async (text) => {
    if (!taskId || !text.trim()) return;
    return addDoc(collection(db, 'tasks', taskId, 'comments'), {
      text: text.trim(),
      authorId: user.uid,
      authorName: adminUser?.displayName || '',
      createdAt: serverTimestamp(),
    });
  }, [taskId, user?.uid, adminUser?.displayName]);

  return { comments, loading, error, addComment };
}
