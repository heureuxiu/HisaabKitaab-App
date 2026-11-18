import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { C, T } from '../../theme';
import Icon from '../../components/Icon';

export const D = '#02154A'; // dark button / title colour
const FIELD_LINE = '#E3E7EC';

export function AuthTitle({ children }) {
  return <Text style={[T(30, 700, { color: C.navy, textAlign: 'center', letterSpacing: -0.9 })]}>{children}</Text>;
}

export function AuthField({ icon, secure, style, ...props }) {
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[{ height: 58, borderRadius: 29, backgroundColor: '#FFFFFF', borderWidth: focus ? 2 : 1, borderColor: focus ? C.navy : FIELD_LINE, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
      <Icon name={icon} size={20} color="#8A94A3" strokeWidth={1.6} />
      <TextInput
        {...props}
        secureTextEntry={hidden}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholderTextColor="#8A94A3"
        autoCorrect={false}
        style={[T(16, 500, { flex: 1, color: C.ink, paddingVertical: 0 })]}
      />
      {secure ? (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
          <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color="#8A94A3" strokeWidth={1.6} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function DarkButton({ label, onPress, loading, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => ({ height: 58, borderRadius: 29, backgroundColor: D, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.45 : pressed ? 0.85 : 1 })}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[T(17, 600, { color: '#FFFFFF' })]}>{label}</Text>}
    </Pressable>
  );
}

export function SoftButton({ icon, label, onPress, bg = '#F1F3F6', disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => ({ height: 58, borderRadius: 29, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 })}>
      <Icon name={icon} size={22} color={C.ink} strokeWidth={1.6} />
      <Text style={[T(16, 600, { color: C.ink })]}>{label}</Text>
    </Pressable>
  );
}

export function LinkLine({ text, action, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 4 }}>
      <Text style={[T(15, 400, { color: C.muted })]}>{text} <Text style={[T(15, 700, { color: C.blue })]}>{action}</Text></Text>
    </Pressable>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <Text style={[T(14, 500, { color: C.orange, textAlign: 'center', lineHeight: 19 })]}>{children}</Text>;
}

export function OrLine() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: FIELD_LINE }} />
      <Text style={[T(14, 400, { color: C.muted })]}>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: FIELD_LINE }} />
    </View>
  );
}
