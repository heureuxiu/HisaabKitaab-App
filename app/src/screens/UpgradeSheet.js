import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../lib/auth';
import GoogleButton from './auth/GoogleButton';
import { AuthTitle, AuthField, DarkButton, ErrorText, OrLine, CodeStep } from './auth/parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * A guest creates a real account (email + code, or Google). Everything saved on this phone is then moved to the
 * new account by the app itself, so no entry is lost.
 */
export default function UpgradeSheet({ visible, onClose }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsCode, setNeedsCode] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('The two passwords do not match');
    setError(''); setBusy(true);
    try { await auth.signup({ name: name.trim(), email: email.trim(), password }); setNeedsCode(true); } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={'padding'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30, paddingHorizontal: 22, gap: 14 }}>
          <Pressable onPress={onClose} accessibilityLabel="Close" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={22} color={C.ink} strokeWidth={1.8} />
          </Pressable>
          {needsCode ? (
            <CodeStep email={email} onVerify={auth.verifySignup} onResend={auth.resendSignup} onBack={() => setNeedsCode(false)} />
          ) : (
            <>
              <AuthTitle>Create your account</AuthTitle>
              <Text style={[T(14, 400, { color: C.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 })]}>
                Add an email and password to keep everything you have entered. It moves to your account, and you can log in on any phone.
              </Text>
              <View style={{ height: 4 }} />
              <AuthField icon="user" placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" textContentType="name" />
              <AuthField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
              <AuthField icon="lock" placeholder="Password" secure value={password} onChangeText={setPassword} autoCapitalize="none" textContentType="newPassword" />
              <AuthField icon="lock" placeholder="Confirm password" secure value={confirm} onChangeText={setConfirm} autoCapitalize="none" textContentType="newPassword" />
              <ErrorText>{error}</ErrorText>
              <DarkButton label="Create account" onPress={submit} loading={busy} />
              <OrLine />
              <GoogleButton onError={setError} disabled={busy} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
