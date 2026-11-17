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
export function Rises({ children, start = 120, step = 70 }) {
  return <>{React.Children.toArray(children).map((c, i) => <Rise key={i} delay={start + i * step}>{c}</Rise>)}</>;
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

/** Wraps a tab screen so it eases in softly when its tab is opened. Only a light opacity change:
 *  moving or fully fading a screen shows the white page behind it, which looks like a flash. */
export function withFocusRise(Screen) {
  const { useIsFocused } = require('@react-navigation/native');
  return function Risen(props) {
    const focused = useIsFocused();
    const v = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      if (!focused) return undefined;
      v.setValue(0);
      const a = Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true });
      a.start();
      return () => a.stop();
    }, [focused, v]);
    return (
      <Animated.View style={{ flex: 1, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }}>
        <Screen {...props} />
      </Animated.View>
    );
  };
}
