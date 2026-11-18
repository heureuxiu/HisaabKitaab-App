import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import Icon from './Icon';

const ICON = { Home: 'card', Activity: 'swap', Budgets: 'budgets', Savings: 'vault', Reports: 'grid' };
const MAX = 54;
const PAD = 3;

function Item({ on, name, onPress, size }) {
  const pop = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: on ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [on, pop]);
  return (
    <Pressable accessibilityLabel={name} onPress={onPress} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) }, { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) }] }}>
        <Icon name={ICON[name]} size={Math.round(size * 0.44)} color={on ? '#FFFFFF' : '#2A3446'} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

/** Floating grey pill. The black circle glides to the tab you pick, and the icon pops. */
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottom = 22 + Math.max(0, insets.bottom - 14);
  const n = state.routes.length;
  const { width: screenW } = useWindowDimensions();
  // bar width: the design's 288 on a 390 phone, nearly full width on small ones
  const barW = Math.max(200, screenW >= 380 ? screenW - 102 : screenW - 40);
  const SIZE = Math.min(MAX, Math.floor((barW - PAD * 2) / n));
  const w = barW;
  const x = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  const step = n > 1 ? (w - PAD * 2 - SIZE * n) / (n - 1) + SIZE : 0;

  useEffect(() => {
    if (!w) return;
    const to = PAD + state.index * step;
    if (first.current) { x.setValue(to); first.current = false; return; }
    Animated.spring(x, { toValue: to, friction: 8, tension: 90, useNativeDriver: true }).start();
    // a little stretch while it travels
    Animated.sequence([
      Animated.timing(squash, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(squash, { toValue: 0, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [state.index, w, step, x, squash]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} locations={[0, 0.7]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 + Math.max(0, insets.bottom - 14) }} />
      <View style={{ alignSelf: 'center', width: barW, marginBottom: bottom, height: SIZE + 4, borderRadius: (SIZE + 4) / 2, backgroundColor: 'rgba(228,232,238,0.95)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD }}>
        {(
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 2, width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: '#000', transform: [{ translateX: x }, { scaleX: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) }, { scaleY: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) }] }} />
        )}
        {state.routes.map((route, index) => (
          <Item key={route.key} size={SIZE} name={route.name} on={state.index === index} onPress={() => { if (state.index !== index) navigation.navigate(route.name); }} />
        ))}
      </View>
    </View>
  );
}
