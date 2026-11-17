import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, T } from '../theme';
import Icon from './Icon';

// Bubble slots from the Reports board (x, y, max diameter), largest share first. Board width is 390.
const SLOTS = [
  { x: 169, y: 239, max: 200 },
  { x: 21, y: 98, max: 180 },
  { x: 211, y: 98, max: 150 },
  { x: 34, y: 290, max: 125 },
  { x: 46, y: 424, max: 108 },
];

const sector = (f) => {
  const a = f * 2 * Math.PI;
  const x = 50 - 49 * Math.sin(a), y = 50 - 49 * Math.cos(a);
  return `M50 50 L50 1 A49 49 0 ${f > 0.5 ? 1 : 0} 0 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
};
const arc = (f) => {
  const a = f * 2 * Math.PI, r = 51.5;
  const x = 50 - r * Math.sin(a), y = 50 - r * Math.cos(a);
  return `M50 ${50 - r} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} 0 ${x.toFixed(2)} ${y.toFixed(2)}`;
};

/** Glass bubbles sized by share of spending. items = [{ id, label, icon, value }], any order. */
export function Bubbles({ items, topOffset = 0 }) {
  const { width } = useWindowDimensions();
  const k = width / 390;
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, SLOTS.length);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: topOffset, width, height: 540 * k }}>
      {sorted.map((it, i) => {
        const slot = SLOTS[i];
        const f = it.value / total;
        const d = Math.round(Math.max(80, Math.min(slot.max, 200 * Math.sqrt(f / 0.35))) * k);
        const big = d >= 140 * k;
        return (
          <View key={it.id} style={{ position: 'absolute', left: slot.x * k, top: slot.y * k, width: d, height: d }}>
            <Svg width={d} height={d} viewBox="0 0 100 100" style={{ position: 'absolute', overflow: 'visible' }}>
              <Circle cx={50} cy={50} r={49} fill="rgba(255,255,255,0.10)" />
              {f < 0.999 ? <Path d={sector(f)} fill="rgba(255,255,255,0.20)" /> : <Circle cx={50} cy={50} r={49} fill="rgba(255,255,255,0.20)" />}
              {f < 0.999 ? <Path d={arc(f)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1.3} strokeLinecap="round" /> : null}
            </Svg>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, gap: 2 }}>
              <Icon name={it.icon} size={big ? 24 : 20} color="#FFFFFF" strokeWidth={1.4} />
              <Text numberOfLines={2} style={[T(big ? 13 : 12, 400, { color: '#FFFFFF', textAlign: 'center', lineHeight: 15 })]}>{it.label}</Text>
              <Text style={[T(big ? 19 : 16, 500, { color: '#FFFFFF', letterSpacing: -0.5 })]}>{(f * 100).toFixed(1)}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Last months of spending as rounded bars; the latest one is dark blue. months = [{ key, label, value }]. */
export function MonthBars({ months }) {
  const max = Math.max(1, ...months.map((m) => m.value));
  return (
    <View style={{ flexDirection: 'row', gap: 8, height: 120, alignItems: 'flex-end' }}>
      {months.map((m, i) => {
        const last = i === months.length - 1;
        return (
          <View key={m.key} style={{ flex: 1, alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <View style={{ width: '100%', height: Math.max(6, Math.round((m.value / max) * 90)), borderRadius: 12, backgroundColor: last ? C.navy : '#C9D6F2' }} />
            <Text style={[T(12, last ? 600 : 500, { color: last ? C.ink : C.muted })]}>{m.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
