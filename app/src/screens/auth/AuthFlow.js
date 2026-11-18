import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, View, Animated, Easing } from 'react-native';
import { useAuth } from '../../lib/auth';
import GetStartedScreen from './GetStartedScreen';
import CreateAccountScreen from './CreateAccountScreen';
import SignupScreen from './SignupScreen';
import LoginScreen from './LoginScreen';
import ForgotScreen from './ForgotScreen';

// First visit: Get started, Create your account, Sign up, then Log in. After that: straight to Log in.
const BACK = { create: 'start', signup: 'create', login: 'create', forgot: 'login' };
const ORDER = { start: 0, create: 1, signup: 2, login: 2, forgot: 3 };

export default function AuthFlow() {
  const { welcomed } = useAuth();
  const [stage, setStage] = useState(welcomed ? 'login' : 'start');
  const [out, setOut] = useState(null); // the screen that is leaving, kept on screen until the slide has finished
  const [dir, setDir] = useState(1);
  const shown = useRef(stage);
  const v = useRef(new Animated.Value(1)).current;

  // Both screens stay visible while they cross: the old one drifts away and fades, the new one drifts in.
  // Nothing is ever blank in between, which is what made the change feel like a jerk.
  useEffect(() => {
    if (shown.current === stage) return undefined;
    setDir(ORDER[stage] >= ORDER[shown.current] ? 1 : -1);
    setOut(shown.current);
    shown.current = stage;
    v.setValue(0);
    const a = Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    a.start(({ finished }) => { if (finished) setOut(null); });
    return () => a.stop();
  }, [stage, v]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = stage === 'login' && welcomed ? null : BACK[stage];
      if (!prev) return false;
      setStage(prev);
      return true;
    });
    return () => sub.remove();
  }, [stage, welcomed]);

  const view = (s) => {
    if (s === 'start') return <GetStartedScreen onStart={() => setStage('create')} goLogin={() => setStage('login')} />;
    if (s === 'create') return <CreateAccountScreen goSignup={() => setStage('signup')} goLogin={() => setStage('login')} />;
    if (s === 'signup') return <SignupScreen goBack={() => setStage('create')} goLogin={() => setStage('login')} />;
    if (s === 'forgot') return <ForgotScreen goBack={() => setStage('login')} />;
    return <LoginScreen goCreate={() => setStage('create')} goForgot={() => setStage('forgot')} />;
  };

  const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF' };
  const incoming = {
    opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 1] }),
    transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [36 * dir, 0] }) }],
  };
  const outgoing = {
    opacity: v.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
    transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, -26 * dir] }) }],
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {out ? <Animated.View key={out} pointerEvents="none" style={[fill, outgoing]}>{view(out)}</Animated.View> : null}
      <Animated.View key={stage} style={[fill, out ? incoming : null]}>{view(stage)}</Animated.View>
    </View>
  );
}
