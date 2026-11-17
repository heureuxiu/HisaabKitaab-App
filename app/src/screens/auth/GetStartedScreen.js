import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, C } from '../../theme';
import Icon from '../../components/Icon';
import { Rise } from '../../components/anim';
import Logo from '../../components/Logo';

const shadow = (color) => ({ shadowColor: color, shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 10 });

function Chip({ children }) {
  return (
    <View style={{ height: 26, paddingHorizontal: 11, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center' }}>
      <Text style={[T(11.5, 600, { color: '#FFFFFF' })]}>{children}</Text>
    </View>
  );
}

export default function GetStartedScreen({ onStart, goLogin }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFD' }}>
      <View style={{ position: 'absolute', right: -120, top: -90, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(43,107,208,0.10)' }} />
      <View style={{ position: 'absolute', left: -140, bottom: -130, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(10,45,140,0.06)' }} />

<Rise delay={0} distance={-14}>
      <View style={{ marginTop: insets.top + 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Logo size={34} radius={28} id="gs" />
        <Text style={[T(22, 700, { color: C.ink, letterSpacing: -0.6 })]}>Hisaab Kitaab</Text>
      </View></Rise>

<Rise delay={160} distance={44} duration={700}>
      <View style={{ height: 340, marginTop: 14 }}>
        <LinearGradient colors={['#02154A', '#0A2D8C', '#1E55BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[{ position: 'absolute', left: 18, top: 10, width: 262, height: 164, borderRadius: 24, padding: 18, transform: [{ rotate: '-12deg' }] }, shadow('#0A2D8C')]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Logo size={22} bg={false} /><Text style={[T(12, 600, { color: '#FFFFFF' })]}>Hisaab Kitaab</Text></View>
            <Text style={[T(12, 400, { color: 'rgba(255,255,255,0.7)' })]}>Nov 2026</Text>
          </View>
          <Text style={[T(12, 400, { color: 'rgba(255,255,255,0.7)', marginTop: 28 })]}>Remaining</Text>
          <Text style={[T(30, 600, { color: '#FFFFFF', letterSpacing: -1, marginTop: 2 })]}>PKR 48,500</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}><Chip>Income 150k</Chip><Chip>Saved 30k</Chip></View>
        </LinearGradient>
        <LinearGradient colors={['#2B6BD0', '#4C8DF0', '#8FBBFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[{ position: 'absolute', left: 118, top: 168, width: 262, height: 164, borderRadius: 24, padding: 18, transform: [{ rotate: '12deg' }], overflow: 'hidden' }, shadow('#2B6BD0')]}>
          <Text style={[T(12, 600, { color: '#FFFFFF' })]}>Savings vault</Text>
          <Text style={[T(12, 400, { color: 'rgba(255,255,255,0.8)', marginTop: 20 })]}>Balance</Text>
          <Text style={[T(30, 600, { color: '#FFFFFF', letterSpacing: -1, marginTop: 2 })]}>PKR 275,000</Text>
          <View style={{ alignSelf: 'flex-start', marginTop: 12 }}><Chip>+30,000 this month</Chip></View>
        </LinearGradient>
      </View></Rise>

<Rise delay={380} distance={26}>
      <View style={{ paddingHorizontal: 28, marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Text style={[T(42, 600, { color: C.ink, letterSpacing: -1.4, lineHeight: 54 })]}>Take control{'\n'}of your{'\n'}hisaab</Text>
          <View style={{ flexDirection: 'row', marginLeft: 10, marginBottom: 4 }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F8FAFD' }}><Icon name="budgets" size={22} color="#FFFFFF" strokeWidth={1.6} /></View>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', marginLeft: -12, borderWidth: 3, borderColor: '#F8FAFD' }}><Icon name="vault" size={22} color="#FFFFFF" strokeWidth={1.6} /></View>
          </View>
        </View>
      </View></Rise>

<Rise delay={650} distance={30} style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 22 }}>
      <View>
        <Pressable onPress={onStart} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
          <LinearGradient colors={['#0A2D8C', '#2158D6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[{ height: 62, borderRadius: 31, flexDirection: 'row', alignItems: 'center', paddingLeft: 28, paddingRight: 10 }, shadow('#2158D6')]}>
            <Text style={[T(17, 600, { color: '#FFFFFF', flex: 1 })]}>Get started</Text>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevR" size={22} color="#FFFFFF" strokeWidth={1.8} />
            </View>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={goLogin} hitSlop={8} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={[T(14, 400, { color: C.muted })]}>Already have an account? <Text style={[T(14, 600, { color: C.ink })]}>Log in</Text></Text>
        </Pressable>
      </View></Rise>
    </View>
  );
}
