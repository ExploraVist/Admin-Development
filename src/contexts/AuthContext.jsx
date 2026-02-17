import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ADMIN_EMAILS } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const adminDoc = await loadOrCreateAdminUser(firebaseUser);
        setAdminUser(adminDoc);
      } else {
        setUser(null);
        setAdminUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    return signOut(auth);
  }, []);

  const refreshAdminUser = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, 'adminUsers', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setAdminUser({ id: snap.id, ...snap.data() });
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    adminUser,
    loading,
    login,
    logout,
    refreshAdminUser,
    isAdmin: adminUser?.role === 'admin',
  }), [user, adminUser, loading, login, logout, refreshAdminUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

async function loadOrCreateAdminUser(firebaseUser) {
  const ref = doc(db, 'adminUsers', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());
  const newDoc = {
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    role: isAdmin ? 'admin' : 'member',
    teams: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, newDoc);
  return { id: firebaseUser.uid, ...newDoc };
}
