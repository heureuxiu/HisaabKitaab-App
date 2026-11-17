import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Local reminders only: nothing is sent from a server. They are scheduled on this phone.
export const REMINDERS = [
  { key: 'daily', icon: 'bell', title: 'Daily reminder', sub: 'Every evening at 9:00 PM', body: "Did you add today's expenses?" },
  { key: 'savings', icon: 'vault', title: 'Monthly savings', sub: '5th of every month, 10:00 AM', body: "Time to add this month's savings." },
  { key: 'salary', icon: 'salary', title: 'Salary day', sub: '1st of every month, 10:00 AM', body: "Add this month's salary so your numbers stay right." },
];

const CHANNEL = 'reminders';
const PREFIX = 'hk-';
const MONTHS_AHEAD = 6;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function hasPermission() {
  try { return !!(await Notifications.getPermissionsAsync()).granted; } catch { return false; }
}

/** Asks once; returns true when notifications are allowed. */
export async function ensurePermission() {
  try {
    if (await hasPermission()) return true;
    return !!(await Notifications.requestPermissionsAsync()).granted;
  } catch { return false; }
}

/** The next `count` times (from now) that fall on `day` of a month at hour:minute. */
export function nextMonthly(day, hour, minute, count = MONTHS_AHEAD, now = new Date()) {
  const out = [];
  for (let i = 0; out.length < count && i < count + 2; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, day, hour, minute, 0);
    if (d.getTime() > now.getTime()) out.push(d);
  }
  return out;
}

const types = Notifications.SchedulableTriggerInputTypes || {};
const dailyTrigger = (hour, minute) => (types.DAILY ? { type: types.DAILY, hour, minute, channelId: CHANNEL } : { hour, minute, repeats: true, channelId: CHANNEL });
const dateTrigger = (date) => (types.DATE ? { type: types.DATE, date, channelId: CHANNEL } : { date, channelId: CHANNEL });

async function schedule(identifier, body, trigger) {
  await Notifications.scheduleNotificationAsync({ identifier, content: { title: 'Ledgero', body, sound: false }, trigger });
}

/**
 * Makes the phone match `settings` ({ daily, savings, salary } booleans).
 * Clears our own scheduled reminders first, so it is safe to call on every launch (it also refreshes the rolling window).
 */
export async function applyReminders(settings) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(existing.filter((n) => n.identifier && n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
    const r = Object.fromEntries(REMINDERS.map((x) => [x.key, x]));
    if (settings.daily) await schedule(`${PREFIX}daily`, r.daily.body, dailyTrigger(21, 0));
    if (settings.savings) {
      const dates = nextMonthly(5, 10, 0);
      for (let i = 0; i < dates.length; i += 1) await schedule(`${PREFIX}savings-${i}`, r.savings.body, dateTrigger(dates[i]));
    }
    if (settings.salary) {
      const dates = nextMonthly(1, 10, 0);
      for (let i = 0; i < dates.length; i += 1) await schedule(`${PREFIX}salary-${i}`, r.salary.body, dateTrigger(dates[i]));
    }
    return true;
  } catch {
    return false;
  }
}
