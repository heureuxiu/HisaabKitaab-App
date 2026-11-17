import React, { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useAuth } from '../../lib/auth';
import { SlideIn } from '../../components/anim';
import GetStartedScreen from './GetStartedScreen';
import CreateAccountScreen from './CreateAccountScreen';
import SignupScreen from './SignupScreen';
import LoginScreen from './LoginScreen';
import ForgotScreen from './ForgotScreen';

// First visit: Get started, Create your account, Sign up, then Log in. After that: straight to Log in.
const BACK = { create: 'start', signup: 'create', login: 'create', forgot: 'login' };

export default function AuthFlow() {
  const { welcomed } = useAuth();
  const [stage, setStage] = useState(welcomed ? 'login' : 'start');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = stage === 'login' && welcomed ? null : BACK[stage];
      if (!prev) return false;
      setStage(prev);
      return true;
    });
    return () => sub.remove();
  }, [stage, welcomed]);

  const ORDER = { start: 0, create: 1, signup: 2, login: 2, forgot: 3 };
  const prev = useRef(stage);
  const dir = ORDER[stage] >= ORDER[prev.current] ? 1 : -1;
  useEffect(() => { prev.current = stage; }, [stage]);

  return <SlideIn key={stage} dir={dir}>{view()}</SlideIn>;

  function view() {
  if (stage === 'start') return <GetStartedScreen onStart={() => setStage('create')} goLogin={() => setStage('login')} />;
  if (stage === 'create') return <CreateAccountScreen goSignup={() => setStage('signup')} goLogin={() => setStage('login')} />;
  if (stage === 'signup') return <SignupScreen goBack={() => setStage('create')} goLogin={() => setStage('login')} />;
  if (stage === 'forgot') return <ForgotScreen goBack={() => setStage('login')} />;
  return <LoginScreen goCreate={() => setStage('create')} goForgot={() => setStage('forgot')} />;
  }
}
