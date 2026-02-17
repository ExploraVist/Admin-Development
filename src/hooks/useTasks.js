import { useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useFirestoreQuery } from './useFirestoreQuery';
import { useAuth } from './useAuth';

/**
 * Fetches tasks for a specific team. Only subscribes to that team's tasks,
 * minimizing Firestore reads. Uses the shared query cache so multiple
 * components viewing the same team share one listener.
 */
export function useTeamTasks(teamSlug, statusFilter = null) {
  const queryRef = useMemo(() => {
    if (!teamSlug) return null;
    const constraints = [
      where('team', '==', teamSlug),
      where('parentTaskId', '==', null),
      orderBy('createdAt', 'desc'),
    ];
    if (statusFilter) {
      constraints.splice(1, 0, where('status', '==', statusFilter));
    }
    return query(collection(db, 'tasks'), ...constraints);
  }, [teamSlug, statusFilter]);

  return useFirestoreQuery(queryRef, !!teamSlug);
}

/**
 * Fetches subtasks for a given parent task.
 */
export function useSubtasks(parentTaskId) {
  const queryRef = useMemo(() => {
    if (!parentTaskId) return null;
    return query(
      collection(db, 'tasks'),
      where('parentTaskId', '==', parentTaskId),
      orderBy('createdAt', 'asc')
    );
  }, [parentTaskId]);

  return useFirestoreQuery(queryRef, !!parentTaskId);
}

/**
 * Fetches tasks assigned to the current user across all teams.
 */
export function useMyTasks() {
  const { user } = useAuth();

  const queryRef = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'tasks'),
      where('assigneeId', '==', user.uid),
      where('status', 'in', ['not-started', 'in-progress', 'in-review']),
      orderBy('createdAt', 'desc')
    );
  }, [user?.uid]);

  return useFirestoreQuery(queryRef, !!user);
}

/**
 * Task CRUD operations. All functions are stable (useCallback) and don't
 * cause re-renders when called.
 */
export function useTaskActions() {
  const { user, adminUser } = useAuth();

  const createTask = useCallback(async (data) => {
    const taskData = {
      title: data.title,
      description: data.description || '',
      team: data.team,
      status: 'not-started',
      priority: data.priority || 1,
      assigneeId: data.assigneeId || null,
      assigneeName: data.assigneeName || null,
      claimedAt: null,
      createdBy: user.uid,
      createdByName: adminUser?.displayName || '',
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      parentTaskId: data.parentTaskId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    return addDoc(collection(db, 'tasks'), taskData);
  }, [user?.uid, adminUser?.displayName]);

  const updateTask = useCallback(async (taskId, updates) => {
    const ref = doc(db, 'tasks', taskId);
    return updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    return deleteDoc(doc(db, 'tasks', taskId));
  }, []);

  const claimTask = useCallback(async (taskId) => {
    const ref = doc(db, 'tasks', taskId);
    return updateDoc(ref, {
      assigneeId: user.uid,
      assigneeName: adminUser?.displayName || '',
      claimedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [user?.uid, adminUser?.displayName]);

  const unclaimTask = useCallback(async (taskId) => {
    const ref = doc(db, 'tasks', taskId);
    return updateDoc(ref, {
      assigneeId: null,
      assigneeName: null,
      claimedAt: null,
      updatedAt: serverTimestamp(),
    });
  }, []);

  return { createTask, updateTask, deleteTask, claimTask, unclaimTask };
}
