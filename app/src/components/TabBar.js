import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import Icon from './Icon';

const ICON = { Home: 'card', Activity: 'swap', Budgets: 'budgets', Savings: 'vault', Reports: 'grid' };
const SIZE = 54;
const PAD = 2;

function Item({ on, name, onPress }) {
  const pop = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: on ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [on, pop]);
  return (
    <Pressable accessibilityLabel={name} onPress={onPress} style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) }, { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) }] }}>
        <Icon name={ICON[name]} size={24} color={on ? '#FFFFFF' : '#2A3446'} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

/** Floating grey pill. The black circle glides to the tab you pick, and the icon pops. */
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottom = 22 + Math.max(0, insets.bottom - 14);
  const n = state.routes.length;
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  const step = w ? (w - PAD * 2 - SIZE * n) / (n - 1) + SIZE : 0;

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
  }, [state.index, w, step, x, squash]);

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} locations={[0, 0.7]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 + Math.max(0, insets.bottom - 14) }} />
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginLeft: 52, marginRight: 50, marginBottom: bottom, height: 58, borderRadius: 29, backgroundColor: 'rgba(228,232,238,0.95)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD }}>
        {w ? (
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 2, width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: '#000', transform: [{ translateX: x }, { scaleX: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) }, { scaleY: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) }] }} />
        ) : null}
        {state.routes.map((route, index) => (
          <Item key={route.key} name={route.name} on={state.index === index} onPress={() => { if (state.index !== index) navigation.navigate(route.name); }} />
        ))}
      </View>
    </View>
  );
}
