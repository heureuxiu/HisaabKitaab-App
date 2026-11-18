import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { T } from '../../theme';
import { LogoMark } from '../../components/Logo';

export const SPLASH_MS = 2800;
const NAME = 'Ledgero'.split('');

/**
 * Plain white screen with the Ledgero logo, animated:
 * the mark springs in with a small turn, the letters of the name pop in one by one,
 * then the whole logo breathes gently until the app is ready.
 */
export default function SplashView() {
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
      Animated.sequence([Animated.delay(150), Animated.spring(mark, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true })]),
      ...letters.map((v, i) => Animated.sequence([
        Animated.delay(650 + i * 80),
        Animated.spring(v, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      ])),
    ]);
    intro.start(() => loop.start());
    return () => { intro.stop(); loop.stop(); };
  }, [mark, letters, breathe]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -20, transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}>
        <View style={{ width: 68, height: 68, marginRight: 14, alignItems: 'center', justifyContent: 'center' }}>
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
