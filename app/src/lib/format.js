const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const signed = (v) => (v >= 0 ? `+${money(v)}` : `−${money(Math.abs(v))}`);
export function compact(v) {
  const a = Math.abs(v);
  const sign = v < 0 ? '\u2212' : '';
  if (a >= 1000) {
    const k = Math.round(a / 100) / 10;
    return `${sign}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `${sign}${Math.round(a)}`;
}

const pad = (n) => String(n).padStart(2, '0');
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const todayStr = () => toDateStr(new Date());
export const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}
export const monthTitle = (key) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
export const monthShort = (key) => MONTHS[Number(key.split('-')[1]) - 1].slice(0, 3);
export const dayLong = (s) => {
  const d = parseDate(s);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};
export const dayShort = (s) => {
  const d = parseDate(s);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};
export const isValidDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseDate(s);
  return toDateStr(d) === s;
};

/** "Today", "Yesterday", otherwise "Nov 3". */
export function relDay(s) {
  const t = todayStr();
  if (s === t) return 'Today';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (s === toDateStr(y)) return 'Yesterday';
  return dayShort(s);
}
