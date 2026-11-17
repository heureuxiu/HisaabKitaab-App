import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setToken, setUnauthorizedHandler } from './api';

const AUTH_KEY = 'hisaab.auth';
const WELCOME_KEY = 'hisaab.welcomed';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/** Per-account cached data must never be shown to the next person who logs in on this phone. */
async function wipeLocalData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith('hisaab.cache.') || k.startsWith('hisaab.notif.'));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {}
}

export function AuthProvider({ children }) {
  const [phase, setPhase] = useState('loading'); // loading | out | in
  const [user, setUser] = useState(null);
  const [welcomed, setWelcomed] = useState(false);
  const live = useRef(true);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setPhase('out');
    try { await AsyncStorage.removeItem(AUTH_KEY); } catch {}
    await wipeLocalData();
  }, []);

  const startSession = useCallback(async ({ token, user: u }) => {
    setToken(token);
    setUser(u);
    setPhase('in');
    try {
      await AsyncStorage.multiSet([[AUTH_KEY, JSON.stringify({ token, user: u })], [WELCOME_KEY, '1']]);
    } catch {}
    setWelcomed(true);
  }, []);

  useEffect(() => {
    live.current = true;
    setUnauthorizedHandler(() => { logout(); });
    (async () => {
      let saved = null;
      let seen = false;
      try {
        const [a, w] = await Promise.all([AsyncStorage.getItem(AUTH_KEY), AsyncStorage.getItem(WELCOME_KEY)]);
        saved = a ? JSON.parse(a) : null;
        seen = w === '1';
      } catch {}
      if (!live.current) return;
      setWelcomed(seen);
      if (saved?.token && saved?.user) {
        setToken(saved.token);
        setUser(saved.user);
        setPhase('in');
      } else {
        setPhase('out');
      }
    })();
    return () => { live.current = false; setUnauthorizedHandler(null); };
  }, [logout]);

  const value = useMemo(() => ({
    phase, user, welcomed, logout,
    signup: async (f) => startSession(await authApi.signup(f)),
    login: async (f) => startSession(await authApi.login(f)),
    guest: async () => startSession(await authApi.guest()),
    reset: async (f) => startSession(await authApi.reset(f)),
    upgrade: async (f) => startSession(await authApi.upgrade(f)),
    deleteAccount: async () => { await authApi.deleteAccount(); await logout(); },
    google: async (idToken) => startSession(await authApi.google({ idToken })),
  }), [phase, user, welcomed, logout, startSession]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
