import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../lib/auth';
import { SoftButton } from './parts';

// Google sign-in needs three small packages: expo-auth-session, expo-web-browser, expo-crypto
// (install with `npx expo install expo-auth-session expo-web-browser expo-crypto`) and the client IDs
// from console.cloud.google.com in app/.env. Until then the button explains what is missing.
let GoogleProvider = null;
let WebBrowser = null;
try {
  GoogleProvider = require('expo-auth-session/providers/google');
  WebBrowser = require('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession();
} catch {}

const IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
const configured = !!(GoogleProvider && (IDS.webClientId || IDS.androidClientId || IDS.iosClientId));
const LABEL = 'Continue with Google';

function NotReady({ disabled }) {
  const why = !GoogleProvider
    ? 'Run this in the app folder:\n\nnpx expo install expo-auth-session expo-web-browser expo-crypto\n\nthen restart Expo.'
    : 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and the Android/iOS ones) to app/.env, then restart Expo.';
  return <SoftButton icon="google" label={LABEL} disabled={disabled} onPress={() => Alert.alert('Google sign-in is not set up yet', why)} />;
}

function Ready({ onError, disabled }) {
  const auth = useAuth();
  const [busy, setBusy] = React.useState(false);
  const [request, , promptAsync] = GoogleProvider.useIdTokenAuthRequest(IDS);

  const press = async () => {
    onError?.('');
    setBusy(true);
    try {
      const res = await promptAsync();
      if (res?.type === 'success') {
        const idToken = res.params?.id_token || res.authentication?.idToken;
        if (!idToken) throw new Error('Google did not return a token');
        await auth.google(idToken);
        return;
      }
      if (res?.type === 'error') throw new Error('Google sign-in failed');
    } catch (e) { onError?.(e.message || 'Google sign-in failed'); }
    setBusy(false);
  };
  return <SoftButton icon="google" label={LABEL} onPress={press} disabled={disabled || busy || !request} />;
}

export default function GoogleButton(props) {
  return configured ? <Ready {...props} /> : <NotReady disabled={props.disabled} />;
}
