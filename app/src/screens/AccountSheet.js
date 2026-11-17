import React from 'react';
import { Modal, View, Text, ScrollView, Alert } from 'react-native';
import { C, T } from '../theme';
import { useAuth } from '../lib/auth';
import { Hero, TopBar, GlassBtn, Sheet, InfoRow, Cta } from '../components/ui';

export default function AccountSheet({ visible, onClose }) {
  const auth = useAuth();
  const u = auth.user;
  if (!u) return null;

  const confirmLogout = () => {
    const warn = u.guest
      ? 'You are using a guest account. Logging out removes access to its data for good, because a guest has no email or password to log back in with.'
      : 'You can log back in any time with your email and password.';
    Alert.alert('Log out?', warn, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { onClose(); auth.logout(); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Hero h={200}>
          <TopBar left={<GlassBtn icon="close" label="Close" onPress={onClose} />} title="Account" />
          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <Text style={[T(28, 600, { color: '#FFFFFF', letterSpacing: -0.8 })]}>{u.guest ? 'Guest' : u.name}</Text>
            <Text style={[T(15, 400, { color: C.onDark, marginTop: 6 })]}>{u.guest ? 'No email on this account' : u.email}</Text>
          </View>
        </Hero>
        <Sheet top={26} gap={16} bottom={40}>
          {u.guest ? (
            <Text style={[T(14, 400, { color: C.muted, lineHeight: 20 })]}>
              This is a guest account. Your data is saved on the server for this phone only. If you log out or lose the phone, it cannot be recovered.
            </Text>
          ) : (
            <Text style={[T(14, 400, { color: C.muted, lineHeight: 20 })]}>Everything you add is saved to your account, so you will see the same data on any phone you log in on.</Text>
          )}
          <Cta label="Log out" icon="logout" onPress={confirmLogout} />
        </Sheet>
      </ScrollView>
    </Modal>
  );
}
