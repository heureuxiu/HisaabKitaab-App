import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { useLedger } from './ledger';
import { buildAlerts } from './alerts';
import { applyReminders, ensurePermission, hasPermission } from './reminders';
import { toDateStr } from './format';
import { useAuth } from './auth';

const READ_PREFIX = 'hisaab.notif.read.';
const REM_KEY = 'hisaab.reminders';
const NO_REMINDERS = { daily: false, savings: false, salary: false };

const Ctx = createContext(null);
export const useNotify = () => useContext(Ctx);

export function NotificationsProvider({ children }) {
  const L = useLedger();
  const { user } = useAuth();
  const READ_KEY = `${READ_PREFIX}${user ? user.id : 'anon'}`;
  const [vault, setVault] = useState(null);
  const [read, setRead] = useState(null); // Set of ids, null until loaded
  const [reminders, setReminders] = useState(NO_REMINDERS);
  const [visible, setVisible] = useState(false);
  const [fresh, setFresh] = useState(new Set()); // ids that were unread when the sheet opened
  const loaded = useRef(false);

  // Saved read state + reminder switches. If reminders are on, refresh the schedule so it never runs out.
  useEffect(() => {
    (async () => {
      try {
        const [r, s] = await Promise.all([AsyncStorage.getItem(READ_KEY), AsyncStorage.getItem(REM_KEY)]);
        setRead(new Set(r ? JSON.parse(r) : []));
        const saved = s ? { ...NO_REMINDERS, ...JSON.parse(s) } : NO_REMINDERS;
        setReminders(saved);
        if (Object.values(saved).some(Boolean) && (await hasPermission())) applyReminders(saved);
      } catch { setRead(new Set()); }
      loaded.current = true;
    })();
  }, []);

  // Savings activity from the last 7 days (for "taken out of savings") and the balance (for milestones).
  useEffect(() => {
    let live = true;
    const from = new Date(); from.setDate(from.getDate() - 7);
    api.vault(toDateStr(from)).then((v) => { if (live) setVault(v); }).catch(() => { if (live) setVault(null); });
    return () => { live = false; };
  }, [L.entries]);

  const items = useMemo(() => buildAlerts({ month: L.month, summary: L.summary, budgets: L.budgets, target: L.target, vault }),
    [L.month, L.summary, L.budgets, L.target, vault]);
  const unread = read ? items.filter((i) => !read.has(i.id)) : [];

  const open = useCallback(() => {
    setFresh(new Set(unread.map((i) => i.id)));
    setVisible(true);
    if (read && unread.length) {
      const next = new Set([...read, ...unread.map((i) => i.id)]);
      setRead(next);
      AsyncStorage.setItem(READ_KEY, JSON.stringify([...next].slice(-300))).catch(() => {});
    }
  }, [unread, read]);
  const close = useCallback(() => setVisible(false), []);

  const toggleReminder = useCallback(async (key) => {
    const turningOn = !reminders[key];
    if (turningOn && !(await ensurePermission())) {
      Alert.alert('Notifications are off', 'Allow notifications for Hisaab Kitaab in your phone settings, then try again.');
      return;
    }
    const next = { ...reminders, [key]: turningOn };
    setReminders(next);
    AsyncStorage.setItem(REM_KEY, JSON.stringify(next)).catch(() => {});
    const ok = await applyReminders(next);
    if (!ok) Alert.alert('Could not schedule', 'The reminder could not be set on this phone. Reminders need a build or a development client if Expo Go does not allow them.');
  }, [reminders]);

  const value = { items, unreadCount: unread.length, fresh, visible, open, close, reminders, toggleReminder };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
