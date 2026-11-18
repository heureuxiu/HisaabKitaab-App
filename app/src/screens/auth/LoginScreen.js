import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/Logo';
import { Rises } from '../../components/anim';
import { useAuth } from '../../lib/auth';
import { T, C } from '../../theme';
import GoogleButton from './GoogleButton';
import { AuthTitle, AuthField, DarkButton, SoftButton, LinkLine, ErrorText, OrLine, CodeStep } from './parts';

export default function LoginScreen({ goCreate, goForgot }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(null); // 'login' | 'guest'
  const [error, setError] = useState('');
  const [needsCode, setNeedsCode] = useState(false); // a new phone: Clerk emails a code before letting you in

  const run = async (kind, fn) => {
    setError('');
    setBusy(kind);
    try { await fn(); } catch (e) { setError(e.message); }
    setBusy(null);
  };
  const submit = () => {
    if (!email.trim() || !password) return setError('Enter your email and password');
    run('login', async () => { const r = await auth.login({ email, password }); if (r?.needsCode) setNeedsCode(true); });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={'padding'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 30, paddingHorizontal: 22, gap: 14 }}>
<Rises>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 }}><LogoMark size={52} id="au" /><Text style={[T(32, 700, { color: '#02154A', letterSpacing: -1.2 })]}>Ledgero</Text></View>
        {needsCode ? (
          <CodeStep email={email} onVerify={auth.verifyLogin} onResend={auth.resendLogin} onBack={() => setNeedsCode(false)} />
        ) : (<>
        <AuthTitle>Login</AuthTitle>
        <View style={{ height: 8 }} />
        <AuthField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" />
        <AuthField icon="lock" placeholder="Password" secure value={password} onChangeText={setPassword} autoCapitalize="none" autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
        <Pressable onPress={goForgot} hitSlop={8} style={{ alignSelf: 'center' }}>
          <Text style={[T(14, 400, { color: C.ink, textDecorationLine: 'underline' })]}>Forgot Password?</Text>
        </Pressable>
        <ErrorText>{error}</ErrorText>
        <DarkButton label="Login" onPress={submit} loading={busy === 'login'} disabled={!!busy && busy !== 'login'} />
        <View style={{ height: 4 }} />
        <OrLine />
        <GoogleButton onError={setError} disabled={!!busy} />
        <SoftButton icon="guest" label="Continue As Guest" onPress={() => run('guest', auth.guest)} disabled={!!busy} />
        <LinkLine text="Need an account?" action="Sign up" onPress={goCreate} />
        </>)}
      </Rises>
</ScrollView>
    </KeyboardAvoidingView>
  );
}
