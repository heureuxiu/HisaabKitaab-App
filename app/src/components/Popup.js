import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { C, T } from '../theme';
import Icon from './Icon';

const RED = '#D93F2E';
// Badge colours from the v2 popup boards.
const TONES = {
  navy: { fg: C.navy, bg: '#E6EEFC' },
  red: { fg: RED, bg: '#FDECE9' },
  orange: { fg: C.orange, bg: '#FCEBE2' },
  green: { fg: C.green, bg: '#E3F4EC' },
};
const KINDS = {
  soft: { bg: C.soft, fg: C.ink },
  navy: { bg: C.navy, fg: '#FFFFFF' },
  red: { bg: RED, fg: '#FFFFFF' },
  ghost: { bg: 'transparent', fg: C.muted },
  ghostRed: { bg: 'transparent', fg: RED },
  off: { bg: C.soft, fg: '#A5AFBD' },
};

export function PopupButton({ label, kind = 'soft', onPress, disabled, height = 54 }) {
  const k = KINDS[disabled ? 'off' : kind];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ height, borderRadius: height / 2, backgroundColor: k.bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
      <Text style={[T(17, 600, { color: k.fg, letterSpacing: -0.2 })]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Confirmation popup (design: v2 "Popup" boards).
 *  - centred dialog by default, `sheet` makes it a bottom sheet
 *  - `actions` = [{ label, kind, onPress, disabled }]; `row` puts two actions side by side
 *  - `children` goes between the text and the buttons (preview card, input...)
 */
export default function Popup({ visible, onClose, icon, tone = 'navy', title, message, children, actions = [], row, sheet }) {
  const t = TONES[tone];
  const { height } = useWindowDimensions();
  const buttons = row
    ? <View style={{ flexDirection: 'row', gap: 12 }}>{actions.map((a) => <View key={a.label} style={{ flex: 1 }}><PopupButton {...a} /></View>)}</View>
    : <View style={{ gap: 8 }}>{actions.map((a) => <PopupButton key={a.label} {...a} height={a.kind === 'ghost' ? 48 : 54} />)}</View>;
  const body = (
    <>
      {sheet && <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: '#D5DCE6', alignSelf: 'center', marginBottom: 22 }} />}
      <View style={{ alignItems: sheet ? 'flex-start' : 'center' }}>
        <View style={{ width: sheet ? 64 : 68, height: sheet ? 64 : 68, borderRadius: 34, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={30} color={t.fg} strokeWidth={1.8} />
        </View>
        <Text style={[T(24, 600, { color: C.ink, letterSpacing: -0.8, marginTop: 20, textAlign: sheet ? 'left' : 'center' })]}>{title}</Text>
        {!!message && <Text style={[T(16, 400, { color: C.muted, lineHeight: 23, marginTop: 10, textAlign: sheet ? 'left' : 'center' })]}>{message}</Text>}
      </View>
      {children ? <View style={{ marginTop: 22 }}>{children}</View> : null}
      <View style={{ marginTop: row ? 26 : 22 }}>{buttons}</View>
    </>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(6,14,36,0.62)', justifyContent: sheet ? 'flex-end' : 'center', padding: sheet ? 0 : 24 }}>
        <Pressable onPress={() => {}} style={sheet
          ? { backgroundColor: '#FFFFFF', borderTopLeftRadius: 38, borderTopRightRadius: 38, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 34 }
          : { backgroundColor: '#FFFFFF', borderRadius: 34, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24, elevation: 24, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 40, shadowOffset: { width: 0, height: 30 } }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: height * 0.8 }}>{body}</ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** The little entry card shown inside the "Delete this entry?" sheet. */
export function EntryPreview({ icon, fg, tint, title, sub, amount }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, backgroundColor: '#F4F6F9', paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={fg} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[T(17, 600, { color: C.ink, letterSpacing: -0.3 })]} numberOfLines={1}>{title}</Text>
        <Text style={[T(14, 400, { color: C.muted, marginTop: 2 })]} numberOfLines={1}>{sub}</Text>
      </View>
      <Text style={[T(18, 600, { color: C.ink, letterSpacing: -0.4 })]}>{amount}</Text>
    </View>
  );
}
