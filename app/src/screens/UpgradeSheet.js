import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../lib/auth';
import { AuthTitle, AuthField, DarkButton, ErrorText } from './auth/parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A guest adds a name, email and password. Same account, so every entry stays. */
export default function UpgradeSheet({ visible, onClose, onDone }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('The two passwords do not match');
    setError(''); setBusy(true);
    try { await auth.upgrade({ name: name.trim(), email: email.trim(), password }); setBusy(false); onDone(); } catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30, paddingHorizontal: 22, gap: 14 }}>
          <Pressable onPress={onClose} accessibilityLabel="Close" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={22} color={C.ink} strokeWidth={1.8} />
          </Pressable>
          <AuthTitle>Create your account</AuthTitle>
          <Text style={[T(14, 400, { color: C.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 })]}>
            Add an email and password to keep everything you have entered. You will be able to log in on any phone.
          </Text>
          <View style={{ height: 4 }} />
          <AuthField icon="user" placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" textContentType="name" />
          <AuthField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          <AuthField icon="lock" placeholder="Password" secure value={password} onChangeText={setPassword} autoCapitalize="none" textContentType="newPassword" />
          <AuthField icon="lock" placeholder="Confirm password" secure value={confirm} onChangeText={setConfirm} autoCapitalize="none" textContentType="newPassword" />
          <ErrorText>{error}</ErrorText>
          <DarkButton label="Create account" onPress={submit} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
