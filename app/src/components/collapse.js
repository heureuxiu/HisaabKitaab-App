import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContext } from '@react-navigation/native';
import { C, T } from '../theme';
import { useTopExtra } from './ui';

export const COMPACT_H = 132;

/**
 * A screen with a blue header that shrinks while you scroll down and grows back when you scroll up.
 *  h        full height of the header (same numbers as Hero used)
 *  header   the full header content (what used to be inside <Hero>)
 *  compact  the small header shown when collapsed, usually <CompactBar />
 * The header slides up with the scroll (native driver, so it stays smooth), the big content fades out
 * and the compact bar fades in. When you let go half way, it settles open or closed.
 */
export function CollapseScroll({ h, header, compact, children, refreshControl, contentStyle, scrollProps }) {
  const extra = useTopExtra();
  const full = h + extra;
  const small = COMPACT_H + extra;
  const range = full - small;
  const y = useRef(new Animated.Value(0)).current;
  const ref = useRef(null);
  const off = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [viewH, setViewH] = useState(0);
  const flag = useRef(false);

  // Tab screens stay mounted, so without this a screen you left half scrolled came back with its header still
  // collapsed. Going away from the screen and coming back both put it back to the top with the full header.
  const nav = useContext(NavigationContext);
  // body entrance: the content under the header fades up a little each time the tab is opened
  const body = useRef(new Animated.Value(nav && nav.isFocused && !nav.isFocused() ? 0 : 1)).current;
  const reset = useCallback(() => {
    ref.current?.scrollTo({ y: 0, animated: false });
    y.setValue(0);
    off.current = 0;
    flag.current = false;
    setCollapsed(false);
  }, [y]);
  useEffect(() => {
    if (!nav) return undefined;
    const a = nav.addListener('blur', () => { reset(); body.setValue(0); });
    const b = nav.addListener('focus', () => {
      Animated.timing(body, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    return () => { a(); b(); };
  }, [nav, reset, body]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y } } }], {
    useNativeDriver: true,
    listener: (e) => {
      off.current = e.nativeEvent.contentOffset.y;
      const c = off.current > range * 0.5;
      if (c !== flag.current) { flag.current = c; setCollapsed(c); }
    },
  });

  const settle = useCallback(() => {
    const o = off.current;
    if (o > 1 && o < range - 1) ref.current?.scrollTo({ y: o > range / 2 ? range : 0, animated: true });
  }, [range]);

  const clamp = { extrapolate: 'clamp' };
  const lift = y.interpolate({ inputRange: [0, range], outputRange: [0, -range], ...clamp });
  const bigOpacity = y.interpolate({ inputRange: [0, range * 0.55], outputRange: [1, 0], ...clamp });
  const bigScale = y.interpolate({ inputRange: [0, range], outputRange: [1, 0.94], ...clamp });
  const smallOpacity = y.interpolate({ inputRange: [range * 0.55, range], outputRange: [0, 1], ...clamp });
  const smallDrop = y.interpolate({ inputRange: [range * 0.55, range], outputRange: [10, 0], ...clamp });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} onLayout={(e) => setViewH(e.nativeEvent.layout.height)}>
      <Animated.ScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollEndDrag={(e) => { if (Math.abs(e.nativeEvent.velocity?.y || 0) < 0.15) settle(); }}
        onMomentumScrollEnd={settle}
        refreshControl={refreshControl}
        contentContainerStyle={[{ paddingTop: full, minHeight: viewH + range }, contentStyle]}
        {...scrollProps}
      >
        <Animated.View style={{ opacity: body, transform: [{ translateY: body.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{children}</Animated.View>
      </Animated.ScrollView>

      <Animated.View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: full, transform: [{ translateY: lift }] }}>
        <LinearGradient colors={C.gradient} locations={C.gradientAt} style={{ flex: 1, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, overflow: 'hidden' }}>
          <Animated.View pointerEvents={collapsed ? 'none' : 'box-none'} style={{ ...absFill, paddingTop: 22 + extra, paddingHorizontal: 20, opacity: bigOpacity, transform: [{ scale: bigScale }] }}>
            {header}
          </Animated.View>
          <Animated.View pointerEvents={collapsed ? 'box-none' : 'none'} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: small, paddingTop: extra, paddingHorizontal: 16, justifyContent: 'center', opacity: smallOpacity, transform: [{ translateY: smallDrop }] }}>
            {compact}
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const absFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

/** The collapsed header row: small button, title with an optional line under it, small button. */
export function CompactBar({ left, title, sub, right }) {
  return (
    <View style={{ height: COMPACT_H - 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <View style={{ width: 50 }}>{left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text numberOfLines={1} style={[T(23, 600, { color: "#FFFFFF", letterSpacing: -0.6 })]}>{title}</Text>
        {sub ? <Text numberOfLines={1} style={[T(15, 400, { color: "rgba(255,255,255,0.78)", marginTop: 3 })]}>{sub}</Text> : null}
      </View>
      <View style={{ width: 50 }}>{right}</View>
    </View>
  );
}
