import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient as Grad } from 'expo-linear-gradient';
import Svg, { Line, Path, Circle, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { C, T } from '../theme';
import Icon from './Icon';
import { money, monthShort } from '../lib/format';

const STEPS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];
const label = (v) => (v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`);
const day = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const pad = (n) => String(n).padStart(2, '0');
const BLUE = '#2158D6';

/** Smooth path through points that never overshoots (monotone cubic), so the line never dips between two equal balances. */
function smooth(p) {
  const n = p.length;
  if (n === 1) return `M${p[0][0]},${p[0][1]}`;
  const dx = []; const m = [];
  for (let i = 0; i < n - 1; i += 1) { dx.push(p[i + 1][0] - p[i][0]); m.push((p[i + 1][1] - p[i][1]) / dx[i]); }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i += 1) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i += 1) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i]; const b = t[i + 1] / m[i]; const s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    d += ` C${(p[i][0] + h).toFixed(1)},${(p[i][1] + t[i] * h).toFixed(1)} ${(p[i + 1][0] - h).toFixed(1)},${(p[i + 1][1] - t[i + 1] * h).toFixed(1)} ${p[i + 1][0].toFixed(1)},${p[i + 1][1].toFixed(1)}`;
  }
  return d;
}

/**
 * Savings balance over time, in a card with a growth summary on top.
 * start = balance before `from`; items are the entries in range (oldest first). `from` may be '' (all time).
 */
export default function BalanceChart({ start, items, from, today }) {
  const [w, setW] = React.useState(0);
  const H = 178, plotH = 150, gut = 36, padR = 22;

  const x0s = from || (items[0] ? items[0].date : today);
  const lastDate = items.length ? items[items.length - 1].date : today;
  const x1s = lastDate > today ? lastDate : today;
  const x0 = day(x0s);
  const x1 = Math.max(day(x1s), x0 + 1);

  // one point per day: the balance at the end of that day
  const pts = [];
  let run = start;
  if (!items.length || items[0].date > x0s) pts.push({ date: x0s, v: run, used: false });
  for (const it of items) {
    const before = run;
    run += it.type === 'add' ? it.amount : -it.amount;
    const last = pts[pts.length - 1];
    if (last && last.date === it.date) { last.v = run; last.used = last.used || run < before; } else pts.push({ date: it.date, v: run, used: run < before });
  }
  if (pts[pts.length - 1].date < x1s) pts.push({ date: x1s, v: run, used: false });

  const maxVal = Math.max(1, ...pts.map((p) => p.v));
  const step = STEPS.find((s) => s * 3 >= maxVal * 1.05) || STEPS[STEPS.length - 1];
  const hi = step * 3.2;
  const aw = Math.max(0, w - gut - padR);
  const X = (s) => gut + ((day(s) - x0) / (x1 - x0)) * aw;
  const Y = (v) => plotH - (Math.max(0, v) / hi) * (plotH - 40);

  const xy = pts.map((p) => [X(p.date), Y(p.v)]);
  const line = w > 0 ? smooth(xy) : '';
  const area = w > 0 ? `${line} L${xy[xy.length - 1][0].toFixed(1)},${plotH} L${xy[0][0].toFixed(1)},${plotH} Z` : '';
  const lx = xy[xy.length - 1]?.[0] ?? 0;
  const ly = xy[xy.length - 1]?.[1] ?? 0;
  const tipX = Math.min(Math.max(lx - 34, 0), Math.max(0, w - 68));

  const ticks = [];
  const span = x1 - x0;
  if (span <= 40) {
    for (let d = x0; d <= x1; d += 7) ticks.push({ at: d, text: String(new Date(d * 86400000).getUTCDate()) });
  } else {
    const [sy, sm, sd] = x0s.split('-').map(Number);
    let y = sy, m = sd === 1 ? sm : sm + 1;
    if (m > 12) { m = 1; y += 1; }
    const all = [];
    for (;;) {
      const key = `${y}-${pad(m)}`;
      const at = day(`${key}-01`);
      if (at > x1) break;
      all.push({ at, text: monthShort(key) });
      m += 1; if (m > 12) { m = 1; y += 1; }
    }
    const stride = Math.max(1, Math.ceil(all.length / 6));
    all.forEach((t, i) => { if (i % stride === 0) ticks.push(t); });
  }
  const tickX = (at) => gut + ((at - x0) / (x1 - x0)) * aw;

  const change = run - start;
  const pct = start > 0 ? Math.round((change / start) * 100) : null;
  const dots = pts.length <= 14;

  return (
    <Grad colors={['#F5F8FC', '#EDF1F7']} style={{ borderRadius: 28, borderWidth: 1, borderColor: '#E3E9F1', paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 2, paddingBottom: 8 }}>
        <View>
          <Text style={[T(13, 500, { color: C.muted })]}>Change in this period</Text>
          <Text style={[T(28, 600, { color: C.ink, letterSpacing: -1, lineHeight: 32, marginTop: 2 })]}>{change >= 0 ? '+' : '−'}{money(Math.abs(change))}</Text>
        </View>
        {pct !== null ? (
          <View style={{ height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: change >= 0 ? '#DCE8FB' : '#FCE9DF', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name={change >= 0 ? 'arrowOut' : 'down'} size={14} color={change >= 0 ? C.navy : '#C4501F'} strokeWidth={2} />
            <Text style={[T(13, 600, { color: change >= 0 ? C.navy : '#C4501F' })]}>{Math.abs(pct)}%</Text>
          </View>
        ) : null}
      </View>

      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H + 4 }}>
        {w > 0 && (
          <>
            <Svg width={w} height={H}>
              <Defs>
                <LinearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#2B6BD0" stopOpacity="0.34" />
                  <Stop offset="1" stopColor="#2B6BD0" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="balLine" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#2B6BD0" />
                  <Stop offset="1" stopColor="#0A2D8C" />
                </LinearGradient>
              </Defs>
              {[1, 2, 3].map((k) => <Line key={k} x1={gut - 6} x2={w} y1={Y(step * k)} y2={Y(step * k)} stroke="#D9E0EA" strokeDasharray="3 5" />)}
              <Line x1={lx} x2={lx} y1={ly + 8} y2={plotH} stroke={BLUE} strokeOpacity={0.35} strokeDasharray="3 4" />
              <Path d={area} fill="url(#bal)" />
              <Path d={line} fill="none" stroke="url(#balLine)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
              {pts.slice(0, -1).map((p, i) => (dots || p.used) ? (
                <Circle key={i} cx={xy[i][0]} cy={xy[i][1]} r={4} fill="#FFFFFF" stroke={p.used ? C.orange : BLUE} strokeWidth={2.2} />
              ) : null)}
              <Circle cx={lx} cy={ly} r={9} fill={BLUE} fillOpacity={0.16} />
              <Circle cx={lx} cy={ly} r={5.5} fill={C.navy} stroke="#FFFFFF" strokeWidth={2.5} />
              <G x={tipX} y={Math.max(2, ly - 40)}>
                <Rect width={68} height={26} rx={13} fill={C.ink} />
                <Path d={`M${lx - tipX - 6},26 L${lx - tipX},31 L${lx - tipX + 6},26 Z`} fill={C.ink} />
                <SvgText x={34} y={17.5} textAnchor="middle" fontSize={12.5} fontFamily="InterTight_600SemiBold" fill="#FFFFFF">{money(run)}</SvgText>
              </G>
            </Svg>
            {[1, 2, 3].map((k) => (
              <Text key={k} style={[T(11, 500, { position: 'absolute', left: 0, top: Y(step * k) - 7, color: '#8A95A6' })]}>{label(step * k)}</Text>
            ))}
            {ticks.map((t, i) => (
              <Text key={i} style={[T(12, i === ticks.length - 1 ? 600 : 500, { position: 'absolute', top: plotH + 8, left: tickX(t.at) - 8, color: i === ticks.length - 1 ? C.ink : '#8A95A6' })]}>{t.text}</Text>
            ))}
          </>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 6 }}>
        <Legend color={BLUE} bar text="Balance" />
        <Legend color={BLUE} text="Savings added" />
        <Legend color={C.orange} text="Used" />
      </View>
    </Grad>
  );
}

function Legend({ color, text, bar }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {bar ? <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: color }} />
        : <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: color, backgroundColor: '#FFFFFF' }} />}
      <Text style={[T(12, 500, { color: C.muted })]}>{text}</Text>
    </View>
  );
}
