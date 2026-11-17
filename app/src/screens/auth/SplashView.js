import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { T } from '../../theme';
import { LogoMark } from '../../components/Logo';

export const SPLASH_MS = 2800;
const NAME = 'Ledgero'.split('');

/**
 * Plain white screen with the Ledgero logo, animated:
 * a soft ring ripples out, the mark springs in with a small turn, the letters of the name pop in one by one,
 * then the whole logo breathes gently until the app is ready.
 */
export default function SplashView() {
  const ring = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const letters = useRef(NAME.map(() => new Animated.Value(0))).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const out = Easing.out(Easing.cubic);
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const intro = Animated.parallel([
      Animated.timing(ring, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([Animated.delay(350), Animated.timing(ring2, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true })]),
      Animated.sequence([Animated.delay(150), Animated.spring(mark, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true })]),
      ...letters.map((v, i) => Animated.sequence([
        Animated.delay(650 + i * 80),
        Animated.spring(v, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      ])),
    ]);
    intro.start(() => loop.start());
    return () => { intro.stop(); loop.stop(); };
  }, [ring, ring2, mark, letters, breathe]);

  const ripple = (v, size) => (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: '#2B6BD0',
      opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.3] }) }],
    }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -20, transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}>
        <View style={{ width: 68, height: 68, marginRight: 14, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 34, top: 34 }}>{ripple(ring, 230)}{ripple(ring2, 230)}</View>
          <Animated.View style={{
            opacity: mark,
            transform: [
              { scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
              { rotate: mark.interpolate({ inputRange: [0, 1], outputRange: ['-16deg', '0deg'] }) },
            ],
          }}>
            <LogoMark size={68} id="sp" />
          </Animated.View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {NAME.map((ch, i) => (
            <Animated.Text key={i} style={[T(50, 700, { color: '#02154A', letterSpacing: -2 }), {
              opacity: letters[i],
              transform: [
                { translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
                { scale: letters[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              ],
            }]}>{ch}</Animated.Text>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
