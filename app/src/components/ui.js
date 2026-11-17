import React from 'react';
import { View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, T } from '../theme';
import Icon from './Icon';
import { monthTitle, shiftMonth, monthKey } from '../lib/format';

/* ------------------------------------------------------------------ hero (blue gradient header) */

/** Extra top space so the design's first row clears the status bar / notch. */
export const useTopExtra = () => Math.max(0, useSafeAreaInsets().top - 12);

/** Blue gradient header with a 44px rounded bottom. h = height on the design board (status bar excluded). */
export function Hero({ h, children }) {
  const extra = useTopExtra();
  return (
    <LinearGradient colors={C.gradient} locations={C.gradientAt} style={{ height: h + extra, paddingTop: 22 + extra, paddingHorizontal: 20, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, overflow: 'hidden' }}>
      {children}
    </LinearGradient>
  );
}

export function GlassBtn({ icon, label, onPress, dot, size = 54 }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassLine, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Icon name={icon} size={size < 50 ? 20 : 24} color="#FFFFFF" strokeWidth={1.5} />
      {dot ? <View style={{ position: 'absolute', top: size < 50 ? 9 : 13, right: size < 50 ? 10 : 14, width: 10, height: 10, borderRadius: 5, backgroundColor: '#F2995A', borderWidth: 1.5, borderColor: '#0A2D8C' }} /> : null}
    </Pressable>
  );
}

/** On / off switch in the design's style (black when on). */
export function Toggle({ on, onPress, label }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} hitSlop={8}
      style={{ width: 52, height: 30, borderRadius: 15, backgroundColor: on ? '#000000' : '#D5DAE1', padding: 3, justifyContent: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignSelf: on ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );
}

/** Row of [left button] title [right button]. Pass null for an empty side. */
export function TopBar({ left, title, right, onTitlePress }) {
  return (
    <View style={{ height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {left || <View style={{ width: 54 }} />}
      {title ? <Pressable onPress={onTitlePress} hitSlop={8}><Text style={[T(20, 500, { letterSpacing: -0.5, color: '#FFFFFF' })]}>{title}</Text></Pressable> : <View />}
      {right || <View style={{ width: 54 }} />}
    </View>
  );
}

/** Big white amount with a dim "PKR" prefix. */
export function Big({ value, size = 60 }) {
  return (
    <Text numberOfLines={1} adjustsFontSizeToFit style={[T(size, 500, { color: '#FFFFFF', letterSpacing: -size * 0.055, lineHeight: size + 4, textAlign: 'center' })]}>
      <Text style={[T(Math.round(size * 0.42), 500, { color: C.onDarkSoft, letterSpacing: -0.5 })]}>PKR </Text>{value}
    </Text>
  );
}

export function GlassPill({ text, icon }) {
  return (
    <View style={{ height: 31, paddingHorizontal: 14, borderRadius: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassLine, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
      {icon ? <Icon name={icon} size={16} color="rgba(255,255,255,0.9)" strokeWidth={1.6} /> : null}
      <Text style={[T(15, 400, { color: 'rgba(255,255,255,0.9)' })]}>{text}</Text>
    </View>
  );
}

/** Centered label / big amount / pill block under the top bar (design: label centre y=135, amount y=188, pill y=247). */
export function HeroCenter({ label, value, pill, top = 47 }) {
  return (
    <View style={{ marginTop: top, alignItems: 'center' }}>
      <Text style={[T(19, 400, { color: C.onDark, lineHeight: 24 })]}>{label}</Text>
      <View style={{ marginTop: 9, alignSelf: 'stretch' }}><Big value={value} /></View>
      <View style={{ marginTop: 11 }}>{pill}</View>
    </View>
  );
}

/** Three stacked translucent cards peeking from the bottom of the hero. */
export function Peek({ left, right, onPress }) {
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 129, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 52, right: 52, top: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'rgba(255,255,255,0.13)' }} />
      <View style={{ position: 'absolute', left: 36, right: 36, top: 20, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(255,255,255,0.20)' }} />
      <Pressable onPress={onPress} disabled={!onPress} style={{ position: 'absolute', left: 21, right: 21, top: 41, bottom: 0 }}>
        <LinearGradient colors={['rgba(124,172,232,0.75)', 'rgba(102,160,226,0.95)']} style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 17, paddingHorizontal: 17, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[T(16, 400, { color: 'rgba(255,255,255,0.88)' })]}>{left}</Text>
          <Text style={[T(16, 400, { color: 'rgba(255,255,255,0.88)' })]}>{right}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ sheet content */

/** White area under the hero. bottom leaves room for the floating tab bar. */
export function Sheet({ children, bottom = 140, top = 22, gap = 16, style }) {
  return <View style={[{ paddingTop: top, paddingHorizontal: 20, paddingBottom: bottom, gap }, style]}>{children}</View>;
}

export function ActionPill({ icon, label, onPress, dark }) {
  const inner = (
    <>
      <Icon name={icon} size={21} color={dark ? '#FFFFFF' : C.ink} strokeWidth={1.5} />
      <Text style={[T(17, 500, { letterSpacing: -0.3, color: dark ? '#FFFFFF' : C.ink })]}>{label}</Text>
    </>
  );
  const st = { flex: 1, height: 54, borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' };
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}>
      {dark ? <View style={[st, { backgroundColor: '#000' }]}>{inner}</View>
        : <LinearGradient colors={['#E9ECF0', '#F4F6F8']} style={st}>{inner}</LinearGradient>}
    </Pressable>
  );
}

export function RoundBtn({ icon, onPress, label, size = 54 }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <LinearGradient colors={['#E9ECF0', '#F4F6F8']} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={C.ink} strokeWidth={1.5} />
      </LinearGradient>
    </Pressable>
  );
}

export function Sec({ title, right, onRight }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={[T(26, 500, { letterSpacing: -1.1, lineHeight: 32, color: C.ink })]}>{title}</Text>
      {right ? <Pressable onPress={onRight} hitSlop={10}><Text style={[T(17, 400, { color: C.muted })]}>{right}</Text></Pressable> : null}
    </View>
  );
}

/** One list row: grey round icon, title + sub, amount. */
export function Row({ icon, title, sub, amount, color = C.ink, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 41, height: 41, borderRadius: 21, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={C.tileIcon} strokeWidth={1.5} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[T(18, 500, { letterSpacing: -0.4, lineHeight: 22, color: C.ink })]}>{title}</Text>
        <Text numberOfLines={1} style={[T(13, 400, { color: C.muted, marginTop: 2 })]}>{sub}</Text>
      </View>
      <Text style={[T(18, 500, { letterSpacing: -0.4, color })]}>{amount}</Text>
    </Pressable>
  );
}

/** Segmented control. dark = glass on the hero, light = grey on the sheet. options = [[id, label], ...] */
export function Seg({ options, value, onChange, dark = true }) {
  return (
    <View style={[{ flexDirection: 'row', padding: 4, borderRadius: 24, gap: 2 }, dark ? { backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassLine } : { backgroundColor: C.soft }]}>
      {options.map(([id, label]) => {
        const on = id === value;
        const bg = on ? (dark ? '#FFFFFF' : '#000000') : 'transparent';
        const fg = on ? (dark ? C.ink : '#FFFFFF') : (dark ? 'rgba(255,255,255,0.85)' : C.ink);
        return (
          <Pressable key={id} onPress={() => onChange && onChange(id)} style={{ flex: 1, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[T(15, 500, { color: fg })]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Tile({ label, value, color = C.ink, icon }) {
  return (
    <View style={{ flex: 1, minWidth: 0, backgroundColor: C.soft, borderRadius: 22, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text numberOfLines={1} style={[T(14, 500, { color: C.muted, flexShrink: 1 })]}>{label}</Text>
        {icon ? <Icon name={icon} size={20} color={C.muted} strokeWidth={1.6} /> : null}
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[T(20, 500, { letterSpacing: -0.4, color })]}>{value}</Text>
    </View>
  );
}

/** Black pill + round arrow button. */
export function Cta({ label, onPress, disabled, icon = 'arrow', onIcon }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, opacity: disabled ? 0.4 : 1 }}>
      <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => ({ flex: 1, height: 58, borderRadius: 29, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
        <Text style={[T(17, 500, { color: '#FFFFFF' })]}>{label}</Text>
      </Pressable>
      <Pressable onPress={onIcon || onPress} disabled={disabled} accessibilityLabel={label}>
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={24} color={C.ink} strokeWidth={1.6} />
        </View>
      </Pressable>
    </View>
  );
}

/** Soft rounded input row with a leading icon (date / note). */
export function InfoRow({ icon, children, trailing, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ height: 58, borderRadius: 29, backgroundColor: C.soft, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={20} color={C.muted} strokeWidth={1.6} />
      <View style={{ flex: 1 }}>{children}</View>
      {trailing ? <Text style={[T(14, 400, { color: C.muted })]}>{trailing}</Text> : null}
    </Pressable>
  );
}

export function EmptyHint({ children }) {
  return <Text style={[T(14, 400, { color: C.muted, textAlign: 'center', paddingVertical: 20, lineHeight: 20 })]}>{children}</Text>;
}

export function Banner({ text, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: 20, marginTop: 12, backgroundColor: '#FDEBE1', borderRadius: 16, padding: 12 }}>
      <Text style={[T(13, 500, { color: '#C2410C', lineHeight: 18 })]}>{text}</Text>
    </Pressable>
  );
}

export function Field({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[T(13, 500, { color: C.muted, marginBottom: 6 })]}>{label}</Text> : null}
      <TextInput placeholderTextColor={C.muted} {...props}
        style={[T(16, 500, { height: 56, borderRadius: 28, backgroundColor: C.soft, paddingHorizontal: 20, color: C.ink }), style]} />
    </View>
  );
}

export function Button({ label, onPress, disabled, outline }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => ({ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: outline ? C.soft : '#000', opacity: disabled ? 0.4 : pressed ? 0.85 : 1 })}>
      <Text style={[T(17, 500, { color: outline ? C.ink : '#FFFFFF' })]}>{label}</Text>
    </Pressable>
  );
}

/** Modal asking for one whole number (budget limit, savings target). */
export function AmountPrompt({ visible, title, hint, initial, onCancel, onSave }) {
  const [text, setText] = React.useState('');
  React.useEffect(() => { if (visible) setText(initial ? String(initial) : ''); }, [visible, initial]);
  const n = text === '' ? 0 : Number(text);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(2,21,74,0.5)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 32, padding: 22 }}>
          <Text style={[T(22, 500, { color: C.ink, letterSpacing: -0.6 })]}>{title}</Text>
          {hint ? <Text style={[T(14, 400, { color: C.muted, marginTop: 4 })]}>{hint}</Text> : null}
          <View style={{ height: 16 }} />
          <Field value={text} onChangeText={(t) => setText(t.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="0 removes it" autoFocus />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Button label="Cancel" outline onPress={onCancel} /></View>
            <View style={{ flex: 1 }}><Button label="Save" onPress={() => onSave(n)} /></View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Pick any of the last 12 months (plus next month). value / onPick use "YYYY-MM". */
export function MonthPicker({ visible, value, onPick, onClose }) {
  const now = monthKey(new Date());
  const list = Array.from({ length: 13 }, (_, i) => shiftMonth(now, 1 - i));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(2,21,74,0.5)', justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#FFFFFF', borderRadius: 32, padding: 12 }}>
          {list.map((k) => {
            const on = k === value;
            return (
              <Pressable key={k} onPress={() => onPick(k)} style={{ height: 44, borderRadius: 22, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: on ? '#000' : 'transparent' }}>
                <Text style={[T(16, 500, { color: on ? '#FFFFFF' : C.ink })]}>{monthTitle(k)}</Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
