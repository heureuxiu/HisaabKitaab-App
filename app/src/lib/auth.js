import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp } from '@clerk/expo';
import { authApi, setApiMode, setTokenGetter, setUnauthorizedHandler } from './api';
import * as local from './localStore';

// Signing up, logging in, password reset and Google are Clerk's job. This file hides that behind the same small
// interface the screens always used (useAuth()), and adds the guest mode: a ledger kept on this phone only.
const GUEST_KEY = 'hisaab.guest';
const WELCOME_KEY = 'hisaab.welcomed';
const NAME_KEY = 'hisaab.pendingName';

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

/** Clerk reports problems as { error }; turn one into a plain Error with a readable message. */
function check(result) {
  const e = result && result.error;
  if (e) throw new Error(e.longMessage || e.errors?.[0]?.longMessage || e.message || 'Something went wrong. Please try again.');
  return result;
}
const finish = (resource) => resource.finalize({ navigate: () => {} }); // switches the app to the new session

const emailOf = (u) => u?.primaryEmailAddress?.emailAddress || u?.emailAddresses?.[0]?.emailAddress || null;

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: cu, isLoaded: userLoaded } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [guest, setGuest] = useState(null); // null = still reading from storage
  const [welcomed, setWelcomed] = useState(false);
  const [migrateFailed, setMigrateFailed] = useState(false);
  const migrating = useRef(false);

  // Set while rendering, so the screens below can never fetch before the right place (phone or server) is chosen.
  setApiMode(isSignedIn ? 'remote' : 'local');
  setTokenGetter(isSignedIn ? () => getToken() : null);

  const forgetGuest = useCallback(async () => {
    setGuest(false);
    try { await AsyncStorage.removeItem(GUEST_KEY); } catch {}
    await local.clear();
  }, []);

  const logout = useCallback(async () => {
    if (isSignedIn) { try { await signOut(); } catch {} }
    if (guest) await forgetGuest();
    await wipeLocalData();
  }, [isSignedIn, signOut, guest, forgetGuest]);

  useEffect(() => {
    setUnauthorizedHandler(() => { logout(); });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      let g = false;
      let seen = false;
      try {
        const [a, w] = await Promise.all([AsyncStorage.getItem(GUEST_KEY), AsyncStorage.getItem(WELCOME_KEY)]);
        g = a === '1';
        seen = w === '1';
      } catch {}
      setWelcomed(seen);
      setGuest(g);
    })();
  }, []);

  // A guest who just created an account: their ledger moves from this phone to the server, once.
  const handingOver = isSignedIn && guest === true && !migrateFailed;
  useEffect(() => {
    if (!handingOver || migrating.current) return;
    migrating.current = true;
    (async () => {
      try {
        const data = await local.exportAll();
        if (local.hasData(data)) await authApi.importData(data);
        await forgetGuest();
      } catch {
        setMigrateFailed(true); // the phone copy stays, and the next start tries again
      }
      migrating.current = false;
    })();
  }, [handingOver, forgetGuest]);

  // The name typed at sign-up is saved on the Clerk profile after the first login.
  useEffect(() => {
    if (!isSignedIn || !cu || cu.firstName) return;
    (async () => {
      try {
        const name = await AsyncStorage.getItem(NAME_KEY);
        if (!name) return;
        await AsyncStorage.removeItem(NAME_KEY);
        await cu.update({ firstName: name });
      } catch {}
    })();
  }, [isSignedIn, cu]);

  const user = useMemo(() => {
    if (isSignedIn && cu) {
      const email = emailOf(cu);
      return { id: cu.id, name: cu.fullName || cu.firstName || (email ? email.split('@')[0] : 'You'), email, guest: false };
    }
    if (!isSignedIn && guest) return { id: 'guest', name: 'Guest', email: null, guest: true };
    return null;
  }, [isSignedIn, cu, guest]);

  const phase = (!isLoaded || guest === null || (isSignedIn && !userLoaded) || handingOver) ? 'loading' : user ? 'in' : 'out';

  useEffect(() => {
    if (user) { AsyncStorage.setItem(WELCOME_KEY, '1').catch(() => {}); setWelcomed(true); }
  }, [user]);

  const value = useMemo(() => ({
    phase, user, welcomed, logout,

    // Email and password. Each returns { needsCode } when Clerk has emailed a code that must be entered next.
    signup: async ({ name, email, password }) => {
      check(await signUp.password({ emailAddress: email.trim(), password }));
      check(await signUp.verifications.sendEmailCode());
      try { await AsyncStorage.setItem(NAME_KEY, name.trim()); } catch {}
      return { needsCode: true };
    },
    verifySignup: async (code) => {
      check(await signUp.verifications.verifyEmailCode({ code: code.trim() }));
      if (signUp.status !== 'complete') throw new Error('Could not finish creating your account. Please try again.');
      check(await finish(signUp));
    },
    resendSignup: async () => { check(await signUp.verifications.sendEmailCode()); },

    login: async ({ email, password }) => {
      check(await signIn.password({ emailAddress: email.trim(), password }));
      if (signIn.status === 'complete') { check(await finish(signIn)); return { needsCode: false }; }
      if (signIn.status === 'needs_client_trust') { // a phone Clerk has not seen before: it emails a code first
        const factor = (signIn.supportedSecondFactors || []).find((f) => f.strategy === 'email_code');
        if (!factor) throw new Error('This login needs an extra check this app does not support yet.');
        check(await signIn.mfa.sendEmailCode());
        return { needsCode: true };
      }
      throw new Error('Could not log you in. Please try again.');
    },
    verifyLogin: async (code) => {
      check(await signIn.mfa.verifyEmailCode({ code: code.trim() }));
      if (signIn.status !== 'complete') throw new Error('That code did not work. Please try again.');
      check(await finish(signIn));
    },
    resendLogin: async () => { check(await signIn.mfa.sendEmailCode()); },

    // Forgot password: send a code, check it, set the new password. The person then logs in with it.
    forgotSend: async (email) => {
      check(await signIn.create({ identifier: email.trim() }));
      check(await signIn.resetPasswordEmailCode.sendCode());
    },
    forgotVerify: async (code) => { check(await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() })); },
    forgotSubmit: async (password) => { check(await signIn.resetPasswordEmailCode.submitPassword({ password })); },

    // Guest: no account, nothing leaves the phone.
    guest: async () => {
      try { await AsyncStorage.setItem(GUEST_KEY, '1'); } catch {}
      setGuest(true);
    },

    deleteAccount: async () => {
      if (isSignedIn) await authApi.deleteAccount(); // the server removes the data and the Clerk login
      await logout();
    },
  }), [phase, user, welcomed, logout, signIn, signUp, isSignedIn]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
