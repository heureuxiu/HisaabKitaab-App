import React from 'react';
import { Alert } from 'react-native';
import { useSSO } from '@clerk/expo';
import { SoftButton } from './parts';

// "Continue with Google" runs through Clerk: it opens Google's page in the phone's browser and Clerk signs the
// person in (or creates the account). No Google Cloud setup is needed while the app uses Clerk's development keys.
// It needs one package: `npx expo install expo-web-browser`. The return address below must be in the Clerk Dashboard
// under Native applications > "Allowlist for mobile SSO redirect".
let WebBrowser = null;
try {
  WebBrowser = require('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession(); // lets the app pick the login back up when it returns from the browser
} catch {}

const REDIRECT = 'ledgero://sso-callback'; // "ledgero" is the scheme in app.json
const LABEL = 'Continue with Google';

function NotReady({ disabled }) {
  return (
    <SoftButton icon="google" label={LABEL} disabled={disabled}
      onPress={() => Alert.alert('Google sign-in is not set up yet', 'Run this in the app folder:\n\nnpx expo install expo-web-browser\n\nthen make a new build.')} />
  );
}

function Ready({ onError, disabled }) {
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = React.useState(false);

  const press = async () => {
    onError?.('');
    setBusy(true);
    try {
      const res = await startSSOFlow({ strategy: 'oauth_google', redirectUrl: REDIRECT });
      const { createdSessionId, setActive, authSessionResult } = res || {};
      if (createdSessionId && setActive) await setActive({ session: createdSessionId }); // the app switches over by itself
      else if (!createdSessionId && authSessionResult && authSessionResult.type === 'success') onError?.('Google sign-in could not be completed. Please try again.');
    } catch (e) {
      onError?.(e?.errors?.[0]?.longMessage || e?.message || 'Google sign-in failed');
    }
    setBusy(false);
  };
  return <SoftButton icon="google" label={LABEL} onPress={press} disabled={disabled || busy} />;
}

export default function GoogleButton(props) {
  return WebBrowser ? <Ready {...props} /> : <NotReady disabled={props.disabled} />;
}
