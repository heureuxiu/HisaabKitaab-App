import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '../../theme';
import Logo from '../../components/Logo';

export const SPLASH_MS = 3200;
const RINGS = [210, 310, 430, 570];

/** About three seconds: rings ripple out, the logo springs in, the name and tagline rise, a bar fills. */
export default function SplashView() {
  const logo = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const foot = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const ripple = useRef(RINGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const out = Easing.out(Easing.cubic);
    const loops = ripple.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 420),
      Animated.timing(v, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])));
    loops.forEach((l) => l.start());
    const pl = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const seq = Animated.parallel([
      Animated.sequence([Animated.delay(150), Animated.spring(logo, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(750), Animated.timing(title, { toValue: 1, duration: 650, easing: out, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(1150), Animated.timing(tag, { toValue: 1, duration: 650, easing: out, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(1500), Animated.timing(foot, { toValue: 1, duration: 700, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(500), Animated.timing(bar, { toValue: 1, duration: SPLASH_MS - 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false })]),
    ]);
    seq.start(() => pl.start());
    return () => { loops.forEach((l) => l.stop()); pl.stop(); seq.stop(); };
  }, [logo, title, tag, foot, bar, pulse, ripple]);

  const rise = (v, d = 18) => ({ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }] });

  return (
    <LinearGradient colors={['#010C2E', '#071F6B', '#0F3FA8', '#2B6BD0']} locations={[0, 0.42, 0.78, 1]} style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: '31%' }} pointerEvents="none">
        {RINGS.map((d, i) => (
          <Animated.View key={d} style={{
            position: 'absolute', left: -d / 2, top: -d / 2, width: d, height: d, borderRadius: d / 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
            opacity: ripple[i].interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.9, 0] }),
            transform: [{ scale: ripple[i].interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.08] }) }],
          }} />
        ))}
      </View>
      <Animated.View style={{ marginTop: '22%', opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }, { rotate: logo.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] }) }] }}>
        <Animated.View style={{ padding: 14, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }}>
          <Logo size={116} id="sp" />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[T(40, 700, { color: '#FFFFFF', letterSpacing: -1.4, marginTop: 38 }), rise(title, 26)]}>Hisaab Kitaab</Animated.Text>
      <Animated.Text style={[T(16, 500, { color: 'rgba(255,255,255,0.7)', marginTop: 14 }), rise(tag)]}>Income, savings, kharcha. Sab ek jagah.</Animated.Text>
      <View style={{ width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', marginTop: 40 }}>
        <Animated.View style={{ width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height: '100%', borderRadius: 3, backgroundColor: '#FFFFFF' }} />
      </View>
      <Animated.Text style={[T(13, 500, { color: 'rgba(255,255,255,0.78)', position: 'absolute', bottom: 48 }), { opacity: foot }]}>Your money, your own phone</Animated.Text>
    </LinearGradient>
  );
}
