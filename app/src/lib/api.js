import Constants from 'expo-constants';

const PORT = 4000;

// While you develop, the backend runs on the same computer that serves the app through Expo, so reuse that
// computer's address. For a real build (or a hosted server such as Render) set EXPO_PUBLIC_API_URL, e.g.
// EXPO_PUBLIC_API_URL=https://your-app.onrender.com
function serverUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  const host = (Constants.expoConfig?.hostUri ?? '').split(':')[0];
  return `http://${host || 'localhost'}:${PORT}`;
}

const active = { url: serverUrl() };

export async function loadConfig() {
  return active;
}

let token = null;
let onUnauthorized = null;
/** The login token is added to every /api request. */
export const setToken = (t) => { token = t || null; };
/** Called when the server says the saved login is no longer valid (expired or removed). */
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// A free hosting plan can need up to a minute to wake the server after it has been idle.
const TIMEOUT_MS = 45000;

async function http(path, { method = 'GET', body, auth = true } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers = { 'content-type': 'application/json' };
    if (auth && token) headers.authorization = `Bearer ${token}`;
    const res = await fetch(`${active.url}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && auth && token && onUnauthorized) onUnauthorized();
    if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Server did not respond. It may be waking up, so try again in a moment.');
    if (e.message === 'Network request failed') throw new Error('Cannot reach the server. Check your internet connection.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

const request = (path, opts) => http(`/api${path}`, opts);

export const authApi = {
  signup: ({ name, email, password }) => http('/auth/signup', { method: 'POST', body: { name, email, password }, auth: false }),
  login: ({ email, password }) => http('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  guest: () => http('/auth/guest', { method: 'POST', auth: false }),
  forgot: ({ email }) => http('/auth/forgot', { method: 'POST', body: { email }, auth: false }),
  reset: ({ email, code, password }) => http('/auth/reset', { method: 'POST', body: { email, code, password }, auth: false }),
  google: ({ idToken }) => http('/auth/google', { method: 'POST', body: { idToken }, auth: false }),
  me: () => http('/auth/me'),
};

export const api = {
  entries: (month) => request(`/entries?month=${month}`),
  summary: (month) => request(`/summary?month=${month}`),
  history: (month, months = 6) => request(`/history?month=${month}&months=${months}`),
  budgets: () => request('/budgets'),
  settings: () => request('/settings'),
  addEntry: (e) => request('/entries', { method: 'POST', body: e }),
  updateEntry: (id, e) => request(`/entries/${id}`, { method: 'PUT', body: e }),
  deleteEntry: (id) => request(`/entries/${id}`, { method: 'DELETE' }),
  setBudgets: (b) => request('/budgets', { method: 'PUT', body: b }),
  setTarget: (n) => request('/settings', { method: 'PUT', body: { savingsTarget: n } }),
  vault: (from) => request(`/vault${from ? `?from=${from}` : ''}`),
  addMove: (m) => request('/vault/moves', { method: 'POST', body: m }),
  updateMove: (id, m) => request(`/vault/moves/${id}`, { method: 'PUT', body: m }),
  deleteMove: (id) => request(`/vault/moves/${id}`, { method: 'DELETE' }),
};
