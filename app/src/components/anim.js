import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const OUT = Easing.out(Easing.cubic);

/** Fades and lifts its content in once, after an optional delay. */
export function Rise({ delay = 0, distance = 22, duration = 520, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, { toValue: 1, duration, delay, easing: OUT, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [v, delay, duration]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** Wraps each child in a Rise, one after another. Use as the direct content of a ScrollView. */
export function Rises({ children, start = 60, step = 45, itemStyle }) {
  return <>{React.Children.toArray(children).map((c, i) => <Rise key={i} delay={start + i * step} distance={14} duration={460} style={itemStyle}>{c}</Rise>)}</>;
}

/** A whole screen sliding in from the side it was reached from (dir 1 = forward, -1 = back) while fading. */
export function SlideIn({ dir = 1, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, { toValue: 1, duration: 380, easing: OUT, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [v]);
  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#FFFFFF', opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }), transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [48 * dir, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

/** Soft fade-in, used when one big area (login to app) replaces another. */
export function FadeIn({ duration = 450, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [v, duration]);
  return <Animated.View style={{ flex: 1, opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] }}>{children}</Animated.View>;
}

/** Kept so the tab list in App.js stays the same. A tab screen is NOT faded as a whole any more: dimming it let the
 *  white page behind it show through the blue header, which looked like a white flash. The soft entrance now happens
 *  to the content under the header only (see CollapseScroll), so the blue header never flickers. */
export function withFocusRise(Screen) {
  return Screen;
}
