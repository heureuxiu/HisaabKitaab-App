import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { C, T } from '../theme';
import { useAuth } from '../lib/auth';
import Popup from '../components/Popup';
import UpgradeSheet from './UpgradeSheet';
import { Hero, TopBar, GlassBtn, Sheet, InfoRow, Cta } from '../components/ui';

export default function AccountSheet({ visible, onClose }) {
  const auth = useAuth();
  const u = auth.user;
  if (!u) return null;

  const [ask, setAsk] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [askDel, setAskDel] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const confirmLogout = () => setAsk(true);
  const doLogout = () => { setAsk(false); onClose(); auth.logout(); };

  const closeDelete = () => { setAskDel(false); setTyped(''); };
  const doDelete = async () => {
    setDeleting(true);
    try { await auth.deleteAccount(); setDeleting(false); closeDelete(); onClose(); } catch (e) { setDeleting(false); Alert.alert('Could not delete account', e.message); }
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
              This is a guest account. Your data is saved on this phone only and is never sent anywhere. If you log out, delete the app or lose the phone, it cannot be recovered. Create an account to keep it safe.
            </Text>
          ) : (
            <Text style={[T(14, 400, { color: C.muted, lineHeight: 20 })]}>Everything you add is saved to your account, so you will see the same data on any phone you log in on.</Text>
          )}
          <Cta label="Log out" icon="logout" onPress={confirmLogout} />
          <Pressable accessibilityRole="button" accessibilityLabel="Delete account" onPress={() => setAskDel(true)} style={{ alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16 }}>
            <Text style={[T(15, 600, { color: '#D93F2E' })]}>Delete account</Text>
          </Pressable>
        </Sheet>
      </ScrollView>
      {u.guest ? (
        <Popup visible={ask} onClose={() => setAsk(false)} icon="warning" tone="orange" title="Guest account"
          message="Logging out will permanently delete everything saved in this guest account on this phone. Create an account first to keep your data."
          actions={[{ label: 'Create account', kind: 'navy', onPress: () => { setAsk(false); setUpgrade(true); } },
            { label: 'Log out anyway', kind: 'ghostRed', onPress: doLogout },
            { label: 'Cancel', kind: 'ghost', onPress: () => setAsk(false) }]} />
      ) : (
        <Popup visible={ask} onClose={() => setAsk(false)} icon="logout" tone="navy" title="Log out?" row
          message="You'll be signed out of this device. Your data stays safe and will be here when you log back in."
          actions={[{ label: 'Cancel', kind: 'soft', onPress: () => setAsk(false) }, { label: 'Log out', kind: 'navy', onPress: doLogout }]} />
      )}
      <Popup sheet visible={askDel} onClose={closeDelete} icon="warning" tone="red" title="Delete your account?"
        message="Your entire Ledgero account will be permanently removed. This can't be undone."
        actions={[{ label: deleting ? 'Deleting…' : 'Delete account', kind: 'red', disabled: typed !== 'DELETE' || deleting, onPress: doDelete }, { label: 'Cancel', kind: 'soft', onPress: closeDelete }]}>
        <View style={{ gap: 12 }}>
          {['All entries, budgets and savings are deleted', 'Your vault and reminders are removed too', "This action can't be undone"].map((t) => (
            <Text key={t} style={[T(15, 400, { color: C.ink, lineHeight: 21 })]}>{'\u2715  '}{t}</Text>
          ))}
          <Text style={[T(14, 400, { color: C.muted, marginTop: 6 })]}>Type <Text style={[T(14, 600, { color: C.ink })]}>DELETE</Text> to confirm</Text>
          <TextInput accessibilityLabel="Type DELETE to confirm" value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false}
            style={[T(17, 500, { color: C.ink, height: 56, borderRadius: 20, borderWidth: 1.5, borderColor: typed ? '#D93F2E' : C.line, paddingHorizontal: 18, letterSpacing: 1 })]} />
        </View>
      </Popup>
      <UpgradeSheet visible={upgrade} onClose={() => setUpgrade(false)} />
    </Modal>
  );
}
