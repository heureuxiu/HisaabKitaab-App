// The guest ledger: everything lives on this phone (AsyncStorage) and nothing is sent to the server.
// It answers exactly like the server does (same shapes, same errors), so the screens cannot tell the difference.
// When a guest creates an account, exportAll() hands the data to the server and clear() empties this store.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hisaab.local.v1';
const CATEGORIES = {
  income: ['salary', 'freelance', 'business', 'other_in'],
  expense: ['rent', 'food', 'bills', 'transport', 'other'],
  savings: ['sav_monthly', 'sav_emergency', 'sav_goal'],
};
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MAX_AMOUNT = 1_000_000_000;

let state = null;
let chain = Promise.resolve(); // one change at a time, so two quick taps can never overwrite each other

const blank = () => ({ entries: [], moves: [], budgets: {}, target: 0, seq: 0 });

async function load() {
  if (state) return state;
  let saved = null;
  try { const raw = await AsyncStorage.getItem(KEY); saved = raw ? JSON.parse(raw) : null; } catch {}
  state = { ...blank(), ...(saved || {}) };
  return state;
}

const persist = () => AsyncStorage.setItem(KEY, JSON.stringify(state));

function run(fn, { write = false } = {}) {
  const p = chain.then(async () => {
    const s = await load();
    const out = await fn(s);
    if (write) await persist();
    return out;
  });
  chain = p.catch(() => {});
  return p;
}
const read = (fn) => run(fn);
const change = (fn) => run(fn, { write: true });

const fail = (msg) => { throw new Error(msg); };
const money = (n) => String(Math.max(0, n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const monthOf = (m) => m || new Date().toISOString().slice(0, 7);

function parseAmount(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0 || n > MAX_AMOUNT) fail('amount must be a whole number greater than 0');
  return n;
}
const parseNote = (v) => (typeof v === 'string' ? v.trim().slice(0, 200) : '');

function parseEntry(b = {}) {
  if (!CATEGORIES[b.type]) fail('type must be income, expense or savings');
  if (!CATEGORIES[b.type].includes(b.category)) fail('category does not match type');
  if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) fail('date must look like 2026-11-16');
  return { type: b.type, category: b.category, amount: parseAmount(b.amount), date: b.date, note: parseNote(b.note) };
}

function parseMove(b = {}) {
  if (b.type !== 'add' && b.type !== 'use') fail('type must be add or use');
  if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) fail('date must look like 2026-11-17');
  return { type: b.type, amount: parseAmount(b.amount), date: b.date, note: parseNote(b.note) };
}

const nextId = (s) => { s.seq += 1; return `l${s.seq}`; };
const strip = ({ n, ...rest }) => rest;

function totals(s, month) {
  let income = 0, saved = 0, spent = 0;
  const byCategory = {};
  for (const r of s.entries) {
    if (!r.date.startsWith(month)) continue;
    if (r.type === 'income') income += r.amount;
    else if (r.type === 'savings') saved += r.amount;
    else { spent += r.amount; byCategory[r.category] = (byCategory[r.category] || 0) + r.amount; }
  }
  return { month, income, saved, spent, remaining: income - saved - spent, byCategory };
}

// ---- savings vault (same rules as the server's vault.service) ----
const sign = (i) => (i.type === 'add' ? 1 : -1);
function vaultItems(s) {
  const fromEntries = s.entries.filter((r) => r.type === 'savings').map((r, i) => ({
    id: `e${r.id}`, seq: i, source: 'entry', type: 'add', kind: 'month', amount: r.amount, date: r.date, note: r.note || 'Monthly savings',
  }));
  const fromMoves = [...s.moves].sort((a, b) => a.n - b.n).map((r, i) => ({
    id: `m${r.id}`, moveId: r.id, seq: 1e9 + i, source: 'move', type: r.type, kind: r.type === 'add' ? 'manual' : 'use',
    amount: r.amount, date: r.date, note: r.note || (r.type === 'add' ? 'Added by hand' : 'Used from savings'),
  }));
  return [...fromEntries, ...fromMoves].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.seq - b.seq));
}
const balanceOf = (items) => items.reduce((t, i) => t + sign(i) * i.amount, 0);

function requireNotNegative(s, excludeId, move) {
  const items = vaultItems(s).filter((i) => !(i.source === 'move' && i.moveId === excludeId));
  const available = balanceOf(items);
  const after = available + (move ? sign(move) * move.amount : 0);
  if (after < 0) fail(`Not enough savings. You have PKR ${money(available)} available.`);
}

// ---- the same calls as the server API ----
export const entries = (month) => read((s) => s.entries
  .filter((r) => r.date.startsWith(monthOf(month)))
  .sort((a, b) => (a.date === b.date ? b.n - a.n : a.date < b.date ? 1 : -1))
  .map(strip));

export const summary = (month) => read((s) => totals(s, monthOf(month)));

export const history = (month, months = 6) => read((s) => {
  const n = Math.min(Math.max(parseInt(months, 10) || 6, 1), 24);
  let [y, m] = monthOf(month).split('-').map(Number);
  const list = [];
  for (let i = 0; i < n; i++) {
    list.unshift(`${y}-${String(m).padStart(2, '0')}`);
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }
  return list.map((mo) => { const t = totals(s, mo); return { month: mo, income: t.income, saved: t.saved, spent: t.spent }; });
});

export const budgets = () => read((s) => ({ ...s.budgets }));
export const settings = () => read((s) => ({ savingsTarget: s.target || 0 }));

export const addEntry = (body) => change((s) => {
  const e = parseEntry(body);
  const id = nextId(s);
  s.entries.push({ id, n: s.seq, ...e });
  return { id, ...e };
});

export const updateEntry = (id, body) => change((s) => {
  const e = parseEntry(body);
  const r = s.entries.find((x) => x.id === id);
  if (!r) fail('Entry not found');
  Object.assign(r, e);
  return { id, ...e };
});

export const deleteEntry = (id) => change((s) => {
  const i = s.entries.findIndex((x) => x.id === id);
  if (i < 0) fail('Entry not found');
  s.entries.splice(i, 1);
  return null;
});

export const setBudgets = (body) => change((s) => {
  for (const [cat, v] of Object.entries(body || {})) {
    if (!CATEGORIES.expense.includes(cat)) fail(`Unknown expense category: ${cat}`);
    if (v !== null && (!Number.isInteger(v) || v < 0)) fail(`Budget for ${cat} must be a whole number`);
  }
  for (const [cat, v] of Object.entries(body || {})) {
    if (v === null || v === 0) delete s.budgets[cat]; else s.budgets[cat] = v;
  }
  return { ...s.budgets };
});

export const setTarget = (t) => change((s) => {
  if (!Number.isInteger(t) || t < 0) fail('savingsTarget must be a whole number (0 to clear)');
  s.target = t;
  return { savingsTarget: t };
});

export const vault = (from) => read((s) => {
  if (from && !DATE_RE.test(from)) fail('from must look like 2026-06-01');
  const items = vaultItems(s);
  const before = from ? items.filter((i) => i.date < from) : [];
  const inRange = from ? items.filter((i) => i.date >= from) : items;
  return {
    balance: balanceOf(items),
    start: balanceOf(before),
    added: inRange.filter((i) => i.type === 'add').reduce((t, i) => t + i.amount, 0),
    used: inRange.filter((i) => i.type === 'use').reduce((t, i) => t + i.amount, 0),
    items: inRange.map(({ seq, ...rest }) => rest),
  };
});

export const addMove = (body) => change((s) => {
  const m = parseMove(body);
  requireNotNegative(s, null, m);
  const id = nextId(s);
  s.moves.push({ id, n: s.seq, ...m });
  return { id, ...m };
});

export const updateMove = (id, body) => change((s) => {
  const m = parseMove(body);
  const r = s.moves.find((x) => x.id === id);
  if (!r) fail('Entry not found');
  requireNotNegative(s, id, m);
  Object.assign(r, m);
  return { id, ...m };
});

export const deleteMove = (id) => change((s) => {
  const i = s.moves.findIndex((x) => x.id === id);
  if (i < 0) fail('Entry not found');
  requireNotNegative(s, id, null);
  s.moves.splice(i, 1);
  return null;
});

// ---- hand-over when a guest creates an account ----
export const exportAll = () => read((s) => ({
  entries: s.entries.map(({ type, category, amount, date, note }) => ({ type, category, amount, date, note })),
  moves: s.moves.map(({ type, amount, date, note }) => ({ type, amount, date, note })),
  budgets: { ...s.budgets },
  savingsTarget: s.target || 0,
}));

export const hasData = (d) => !!(d && (d.entries.length || d.moves.length || Object.keys(d.budgets).length || d.savingsTarget));

export const clear = () => change(async (s) => {
  Object.assign(s, blank());
  await AsyncStorage.removeItem(KEY);
});
