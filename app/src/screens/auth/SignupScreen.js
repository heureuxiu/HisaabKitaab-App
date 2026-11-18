import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/Logo';
import { Rises } from '../../components/anim';
import { useAuth } from '../../lib/auth';
import { T, C } from '../../theme';
import Icon from '../../components/Icon';
import { AuthTitle, AuthField, DarkButton, LinkLine, ErrorText, CodeStep, D } from './parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 0-3: length, mixed letters and digits, a symbol or a long password. */
function strength(p) {
  let s = 0;
  if (p.length >= 8) s += 1;
  if (/[a-z]/i.test(p) && /\d/.test(p)) s += 1;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s += 1;
  return s;
}

export default function SignupScreen({ goBack, goLogin }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsCode, setNeedsCode] = useState(false); // Clerk has emailed a code to confirm the address
  const s = strength(password);

  const submit = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('The two passwords do not match');
    if (!agree) return setError('Please accept the Terms and Privacy policy');
    setError('');
    setBusy(true);
    try { await auth.signup({ name, email, password }); setNeedsCode(true); } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={'padding'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30, paddingHorizontal: 22, gap: 14 }}>
<Rises>
        <Pressable onPress={goBack} accessibilityLabel="Back" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={22} color={C.ink} strokeWidth={1.8} />
        </Pressable>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 }}><LogoMark size={52} id="au" /><Text style={[T(32, 700, { color: '#02154A', letterSpacing: -1.2 })]}>Ledgero</Text></View>
        {needsCode ? (
          <CodeStep email={email} onVerify={auth.verifySignup} onResend={auth.resendSignup} onBack={() => setNeedsCode(false)} />
        ) : (<>
        <AuthTitle>Sign up</AuthTitle>
        <View style={{ height: 6 }} />
        <AuthField icon="user" placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" textContentType="name" />
        <AuthField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
        <AuthField icon="lock" placeholder="Password" secure value={password} onChangeText={setPassword} autoCapitalize="none" textContentType="newPassword" />
        {password.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 6, marginHorizontal: 10, marginTop: -4 }}>
            {[0, 1, 2].map((i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < s ? C.green : '#D5DAE1' }} />)}
          </View>
        ) : null}
        <AuthField icon="lock" placeholder="Confirm password" secure value={confirm} onChangeText={setConfirm} autoCapitalize="none" textContentType="newPassword" />
        <Pressable onPress={() => setAgree((a) => !a)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 }}>
          <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: agree ? D : '#FFFFFF', borderWidth: agree ? 0 : 1.5, borderColor: '#B8C0CC', alignItems: 'center', justifyContent: 'center' }}>
            {agree ? <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.4} /> : null}
          </View>
          <Text style={[T(13, 400, { color: C.muted, flex: 1, lineHeight: 18 })]}>I agree to the <Text style={[T(13, 700, { color: C.ink })]}>Terms</Text> and <Text style={[T(13, 700, { color: C.ink })]}>Privacy policy</Text></Text>
        </Pressable>
        <ErrorText>{error}</ErrorText>
        <DarkButton label="Create account" onPress={submit} loading={busy} />
        <LinkLine text="Already have an account?" action="Log in" onPress={goLogin} />
        </>)}
      </Rises>
</ScrollView>
    </KeyboardAvoidingView>
  );
}
