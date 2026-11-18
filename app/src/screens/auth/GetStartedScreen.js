import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, C } from '../../theme';
import Icon from '../../components/Icon';
import { Rise } from '../../components/anim';
import { LogoMark } from '../../components/Logo';

const DEEP = '#02154A';
const shadow = (color, o = 0.18, r = 30, y = 20) => ({ shadowColor: color, shadowOpacity: o, shadowRadius: r, shadowOffset: { width: 0, height: y }, elevation: 12 });

/** Small "Rs" chip used at the top of both cards. */
function Chip({ label }) {
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 4, paddingRight: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)' }}>
      <LinearGradient colors={['#2B6BD0', '#0A2D8C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[T(11, 700, { color: '#FFFFFF' })]}>Rs</Text>
      </LinearGradient>
      <Text style={[T(13, 600, { color: C.ink })]}>{label}</Text>
    </View>
  );
}

export default function GetStartedScreen({ onStart, goLogin }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Everything is drawn for a 390 x ~830 phone and scales down on narrower or shorter ones, so nothing overlaps.
  const usable = height - insets.top - insets.bottom;
  const k = Math.max(0.55, Math.min(1, width / 390, usable / 800));
  const sz = (n) => Math.round(n * k);
  const artTop = insets.top + Math.round(40 * k);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFD', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -140, top: -120, width: 460, height: 460, borderRadius: 230, backgroundColor: 'rgba(43,107,208,0.10)' }} />
      <View style={{ position: 'absolute', left: -150, bottom: -150, width: 440, height: 440, borderRadius: 220, backgroundColor: 'rgba(10,45,140,0.06)' }} />

      {/* Art: logo, swirl, two cards and the tilted pill */}
      <View style={{ position: 'absolute', left: 0, top: artTop, width: 390, height: 400, transformOrigin: 'top left', transform: [{ scale: k }] }}>
        <Rise delay={0} distance={-14} style={{ position: 'absolute', left: 30, top: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <LogoMark size={28} id="gs" />
            <Text style={[T(26, 600, { color: DEEP, letterSpacing: -1 })]}>Ledgero</Text>
          </View>
        </Rise>

        <Rise delay={120} distance={0} duration={900} style={{ position: 'absolute', left: 30, top: 56 }}>
          <Svg width={150} height={100} viewBox="0 0 150 100" fill="none">
            <Path d="M8 88 C 4 60 40 54 52 40 C 64 24 40 10 28 22 C 14 36 52 52 86 36 C 108 26 128 22 140 20" stroke={DEEP} strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
        </Rise>

        <Rise delay={200} distance={40} duration={700} style={{ position: 'absolute', left: 206, top: 14, width: Math.max(230, width / k - 190), height: 196 }}>
          <View style={[{ flex: 1, borderRadius: 30, backgroundColor: '#FFFFFF', padding: 20, paddingHorizontal: 18, overflow: 'hidden' }, shadow('#0A2D8C', 0.14, 30, 22)]}>
            <Chip label="PKR · Income" />
            <Text style={[T(13, 400, { color: '#8A94A3', marginTop: 22 })]}>This month</Text>
            <Text style={[T(30, 500, { color: C.ink, letterSpacing: -1.2, marginTop: 6 })]} numberOfLines={1}>PKR 150,000</Text>
            <Text style={[T(11, 400, { color: '#8A94A3', marginTop: 24 })]}>Salary + freelance</Text>
            <Text style={[T(13, 500, { color: C.ink, marginTop: 4 })]}>12 entries</Text>
            <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 }} />
          </View>
        </Rise>

        <Rise delay={320} distance={48} duration={760} style={{ position: 'absolute', left: 84, top: 152, width: 246, height: 196 }}>
          <LinearGradient colors={['#DCE8FB', '#C9DBF8']} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
            style={[{ flex: 1, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 22 }, shadow('#0A2D8C', 0.2, 26, 20)]}>
            <Chip label="PKR · Cash" />
            <Text style={[T(13, 400, { color: '#5F7BAA', marginTop: 20 })]}>Remaining</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 }}>
              <Text style={[T(30, 500, { color: C.ink, letterSpacing: -1.2 })]}>48,500</Text>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="eye" size={18} color={C.muted} strokeWidth={1.6} />
              </View>
            </View>
            <Text style={[T(11, 400, { color: '#5F7BAA', marginTop: 22 })]}>Saved</Text>
            <Text style={[T(13, 500, { color: C.ink, marginTop: 3 })]}>PKR 30k</Text>
          </LinearGradient>
        </Rise>

        <Rise delay={520} distance={20} style={{ position: 'absolute', left: 176, top: 316, width: 130, height: 62 }}>
          <LinearGradient colors={['rgba(255,255,255,0.97)', 'rgba(233,241,253,0.92)']}
            style={[{ flex: 1, borderRadius: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, transform: [{ rotate: '12deg' }] }, shadow('#0A2D8C', 0.18, 20, 14)]}>
            <Icon name="arrowIn" size={20} color={C.ink} strokeWidth={1.8} />
            <Text style={[T(17, 500, { color: C.ink })]}>Add entry</Text>
          </LinearGradient>
        </Rise>
      </View>

      {/* Headline, text and button sit at the bottom so tall and short phones both look right */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: sz(30), paddingBottom: insets.bottom + sz(22) }}>
        <Rise delay={420} distance={26}>
          <View style={{ paddingLeft: 4 }}>
            <Text style={[T(sz(62), 300, { color: C.ink, letterSpacing: -sz(3), lineHeight: sz(66) })]}>Your</Text>
            <Text style={[T(sz(62), 700, { color: C.ink, letterSpacing: -sz(3), lineHeight: sz(66) })]}>Personal</Text>
            <Text style={[T(sz(62), 300, { color: C.ink, letterSpacing: -sz(3), lineHeight: sz(66) })]}>Ledger</Text>
            <Text style={[T(Math.max(13, sz(15)), 400, { color: C.muted, lineHeight: Math.max(19, sz(22)), marginTop: sz(14), paddingRight: 14 })]}>
              Track income, savings and kharcha in one place, and see exactly where your money goes every month.
            </Text>
          </View>
        </Rise>
        <Rise delay={650} distance={30}>
          <Pressable onPress={onStart} accessibilityRole="button" accessibilityLabel="Get started" style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, marginTop: sz(24) })}>
            <View style={{ height: Math.max(50, sz(58)), borderRadius: 29, backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[T(17, 600, { color: '#FFFFFF' })]}>Get started</Text>
            </View>
          </Pressable>
          <Pressable onPress={goLogin} hitSlop={8} style={{ alignItems: 'center', marginTop: sz(16) }}>
            <Text style={[T(13, 400, { color: C.muted })]}>Already have an account? <Text style={[T(13, 600, { color: C.ink })]}>Log in</Text></Text>
          </Pressable>
        </Rise>
      </View>
    </View>
  );
}
