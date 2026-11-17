import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { monthKey } from './format';
import { useAuth } from './auth';

const Ctx = createContext(null);
export const useLedger = () => useContext(Ctx);

const EMPTY = {
  entries: [],
  summary: { income: 0, saved: 0, spent: 0, remaining: 0, byCategory: {} },
  budgets: {},
  target: 0,
};

export function LedgerProvider({ children }) {
  const { user } = useAuth();
  const uid = user ? user.id : 'anon';
  const [month, setMonth] = useState(monthKey(new Date()));
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);
  const seq = useRef(0);

  const refresh = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    try {
      const [entries, summary, budgets, settings] = await Promise.all([
        api.entries(month), api.summary(month), api.budgets(), api.settings(),
      ]);
      if (mine !== seq.current) return;
      const next = { entries, summary, budgets, target: settings.savingsTarget };
      setData(next);
      setError(null);
      setOffline(false);
      AsyncStorage.setItem(`hisaab.cache.${uid}.${month}`, JSON.stringify(next)).catch(() => {});
    } catch (e) {
      if (mine !== seq.current) return;
      setError(e.message);
      try {
        const raw = await AsyncStorage.getItem(`hisaab.cache.${uid}.${month}`);
        if (raw && mine === seq.current) { setData(JSON.parse(raw)); setOffline(true); }
      } catch {}
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, [month, uid]);

  useEffect(() => { refresh(); }, [refresh]);

  const actions = useMemo(() => ({
    async save(entry, id) {
      if (id) await api.updateEntry(id, entry); else await api.addEntry(entry);
      await refresh();
    },
    async remove(id) { await api.deleteEntry(id); await refresh(); },
    async setBudget(category, amount) { await api.setBudgets({ [category]: amount || null }); await refresh(); },
    async setTarget(n) { await api.setTarget(n); await refresh(); },
  }), [refresh]);

  const value = { month, setMonth, ...data, loading, error, offline, refresh, ...actions };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
