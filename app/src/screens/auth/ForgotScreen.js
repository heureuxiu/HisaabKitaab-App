import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { Rises } from '../../components/anim';
import { useAuth } from '../../lib/auth';
import { authApi } from '../../lib/api';
import { T, C } from '../../theme';
import Icon from '../../components/Icon';
import { AuthTitle, AuthField, DarkButton, LinkLine, ErrorText } from './parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Step 1: enter email, we send a 6-digit code. Step 2: enter the code and a new password, then you are logged in.
export default function ForgotScreen({ goBack }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    setError('');
    setBusy(true);
    try { await authApi.forgot({ email: email.trim() }); setStep(2); } catch (e) { setError(e.message); }
    setBusy(false);
  };

  const reset = async () => {
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from your email');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('The two passwords do not match');
    setError('');
    setBusy(true);
    try { await auth.reset({ email: email.trim(), code: code.trim(), password }); } catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30, paddingHorizontal: 22, gap: 14 }}>
<Rises>
        <Pressable onPress={step === 2 ? () => { setStep(1); setError(''); } : goBack} accessibilityLabel="Back" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={22} color={C.ink} strokeWidth={1.8} />
        </Pressable>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 2 }}><Logo size={34} radius={28} id="au" /><Text style={[T(22, 700, { color: C.ink, letterSpacing: -0.6 })]}>Hisaab Kitaab</Text></View>
        <AuthTitle>{step === 1 ? 'Forgot password' : 'New password'}</AuthTitle>
        <Text style={[T(14, 400, { color: C.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 })]}>
          {step === 1 ? 'Enter your email and we will send you a 6-digit code.' : `We sent a code to ${email.trim()}. It works for 15 minutes.`}
        </Text>
        <View style={{ height: 4 }} />
        {step === 1 ? (
          <>
            <AuthField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="go" onSubmitEditing={sendCode} />
            <ErrorText>{error}</ErrorText>
            <DarkButton label="Send code" onPress={sendCode} loading={busy} />
          </>
        ) : (
          <>
            <AuthField icon="lock" placeholder="6-digit code" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />
            <AuthField icon="lock" placeholder="New password" secure value={password} onChangeText={setPassword} autoCapitalize="none" textContentType="newPassword" />
            <AuthField icon="lock" placeholder="Confirm new password" secure value={confirm} onChangeText={setConfirm} autoCapitalize="none" textContentType="newPassword" />
            <ErrorText>{error}</ErrorText>
            <DarkButton label="Reset password" onPress={reset} loading={busy} />
            <Pressable onPress={sendCode} hitSlop={8} style={{ alignSelf: 'center' }}>
              <Text style={[T(14, 400, { color: C.ink, textDecorationLine: 'underline' })]}>Send a new code</Text>
            </Pressable>
          </>
        )}
        <LinkLine text="Remembered it?" action="Log in" onPress={goBack} />
      </Rises>
</ScrollView>
    </KeyboardAvoidingView>
  );
}
