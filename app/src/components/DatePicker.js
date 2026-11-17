import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { C, T } from '../theme';
import Icon from './Icon';
import { todayStr } from '../lib/format';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Small month calendar in a modal. value / onPick use YYYY-MM-DD. */
export default function DatePicker({ visible, value, onPick, onClose }) {
  const [view, setView] = useState(value.slice(0, 7));
  useEffect(() => { if (visible) setView(value.slice(0, 7)); }, [visible, value]);
  const [y, m] = view.split('-').map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const count = new Date(y, m, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const shift = (d) => { const n = new Date(y, m - 1 + d, 1); setView(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`); };
  const today = todayStr();
  const key = (d) => `${view}-${String(d).padStart(2, '0')}`;
  const arrow = (name, label, onPress) => (
    <Pressable accessibilityLabel={label} onPress={onPress} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={20} color={C.ink} strokeWidth={1.6} />
    </Pressable>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(2,21,74,0.5)', justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#FFFFFF', borderRadius: 32, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            {arrow('chevL', 'Previous month', () => shift(-1))}
            <Text style={[T(18, 500, { color: C.ink, letterSpacing: -0.4 })]}>{MONTHS[m - 1]} {y}</Text>
            {arrow('chevR', 'Next month', () => shift(1))}
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {WEEK.map((w, i) => <Text key={i} style={[T(12, 600, { flex: 1, textAlign: 'center', color: C.muted, paddingVertical: 6 })]}>{w}</Text>)}
          </View>
          {weeks.map((wk, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              {wk.map((d, j) => {
                const sel = d && key(d) === value;
                const isToday = d && key(d) === today;
                return (
                  <Pressable key={j} disabled={!d} onPress={() => onPick(key(d))} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    {d ? (
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: sel ? '#000' : 'transparent', borderWidth: isToday && !sel ? 1.5 : 0, borderColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[T(15, sel ? 600 : 500, { color: sel ? '#FFFFFF' : C.ink })]}>{d}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
