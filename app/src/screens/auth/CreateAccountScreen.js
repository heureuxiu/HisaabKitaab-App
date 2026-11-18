import React, { useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import Svg, { Ellipse, Path, Circle, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rises } from '../../components/anim';
import { useAuth } from '../../lib/auth';
import { T, C } from '../../theme';
import GoogleButton from './GoogleButton';
import { AuthTitle, SoftButton, LinkLine, ErrorText, D } from './parts';

const LB = '#A9C8FF';

function Illustration() {
  const { width, height } = useWindowDimensions();
  const w = Math.max(190, Math.min(300, width - 90, height * 0.3));
  return (
    <Svg width={w} height={w * 236 / 300} viewBox="0 0 300 236" fill="none">
      <Ellipse cx="150" cy="214" rx="92" ry="7" fill={D} opacity={0.1} />
      <Ellipse cx="62" cy="222" rx="14" ry="3.5" stroke={D} strokeWidth="2" />
      <Ellipse cx="250" cy="224" rx="10" ry="3" stroke={D} strokeWidth="2" />
      <Path d="M150 204 C122 186 88 182 54 188 L54 116 C88 110 122 116 150 134 Z" fill={D} />
      <Path d="M150 204 C178 186 212 182 246 188 L246 116 C212 110 178 116 150 134 Z" fill="#0A2D8C" />
      <Circle cx="150" cy="166" r="6" fill="#FFFFFF" />
      <Path d="M150 132 V80" stroke={D} strokeWidth="4" strokeLinecap="round" />
      <Path d="M153 96 C153 70 174 56 202 56 C202 84 180 96 153 96 Z" fill={LB} stroke={D} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M147 110 C147 90 130 78 110 78 C110 98 128 110 147 110 Z" fill="#FFFFFF" stroke={D} strokeWidth="3" strokeLinejoin="round" />
      <Circle cx="236" cy="86" r="17" fill={C.orange} stroke={D} strokeWidth="3" />
      <Circle cx="236" cy="86" r="8" stroke={D} strokeWidth="2.5" />
      <Circle cx="70" cy="76" r="11" fill={LB} stroke={D} strokeWidth="3" />
      <G stroke={D} strokeWidth="3" strokeLinecap="round">
        <Path d="M252 44 l10 -10 M258 56 l14 -3 M244 36 l2 -13" />
        <Path d="M40 138 l-10 -6 M44 150 l-13 2" />
      </G>
    </Svg>
  );
}

export default function CreateAccountScreen({ goSignup, goLogin }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const guest = async () => {
    setError('');
    setBusy(true);
    try { await auth.guest(); } catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ paddingTop: insets.top + Math.min(60, height * 0.06), paddingBottom: insets.bottom + 30, paddingHorizontal: 24, alignItems: 'center' }}>
<Rises itemStyle={{ alignSelf: 'stretch' }}>
      <View style={{ alignItems: 'center' }}><Illustration /></View>
      <View style={{ marginTop: 24 }}><AuthTitle>Create your account</AuthTitle></View>
      <Text style={[T(15, 400, { color: C.ink, textAlign: 'center', lineHeight: 21, marginTop: 10, paddingHorizontal: 10 })]}>
        Your own private ledger. Income, savings and expenses, saved against your account.
      </Text>
      <View style={{ width: '100%', gap: 12, marginTop: 28 }}>
        <GoogleButton onError={setError} disabled={busy} />
        <SoftButton icon="mail" label="Sign up with Email" bg={LB} onPress={goSignup} disabled={busy} />
        <SoftButton icon="guest" label="Continue As Guest" onPress={guest} disabled={busy} />
        <ErrorText>{error}</ErrorText>
        <LinkLine text="Already have an account?" action="Log in" onPress={goLogin} />
      </View>
    </Rises>
</ScrollView>
  );
}
