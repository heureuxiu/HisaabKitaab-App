import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Stroke icons copied from the design boards (24x24 grid).
const P = (d, sw) => ({ t: 'p', d, sw });
const R = (x, y, w, h, rx) => ({ t: 'r', x, y, w, h, rx });
const O = (cx, cy, r) => ({ t: 'c', cx, cy, r });

const ICONS = {
  home: [P('M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z')],
  list: [P('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01')],
  plus: [P('M12 5v14M5 12h14')],
  budgets: [P('M21 12a9 9 0 1 1-9-9'), P('M21 12h-9V3a9 9 0 0 1 9 9z')],
  reports: [P('M5 21V11M12 21V4M19 21v-8')],
  chevL: [P('M15 6l-6 6 6 6')],
  chevR: [P('M9 6l6 6-6 6')],
  close: [P('M6 6l12 12M18 6L6 18')],
  search: [O(11, 11, 7), P('M21 21l-4.3-4.3')],
  calendar: [R(3, 5, 18, 16, 2), P('M3 10h18M8 3v4M16 3v4')],
  pencil: [P('M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z')],
  warning: [P('M12 3l10 18H2z'), P('M12 10v5M12 18h.01')],
  trash: [P('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6')],
  salary: [R(3, 8, 18, 12, 2), P('M8 8V5h8v3')],
  freelance: [R(4, 5, 16, 11, 2), P('M2 20h20')],
  business: [P('M4 9l1-5h14l1 5'), P('M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0'), P('M5 12v8h14v-8')],
  dots: [P('M5 12h.01M12 12h.01M19 12h.01', 3)],
  food: [O(9, 20, 1.3), O(18, 20, 1.3), P('M3 4h2.5l2.2 11h10.6l2-8H6.2')],
  bag: [P('M6 8h12l1 12H5z'), P('M9 8a3 3 0 0 1 6 0')],
  bills: [P('M13 2L4 14h7l-1 8 9-12h-7z')],
  transport: [P('M5 17v-5l1.6-4.4A2 2 0 0 1 8.5 6h7a2 2 0 0 1 1.9 1.6L19 12v5z'), P('M5 12h14'), P('M7 17v3M17 17v3')],
  wallet: [P('M3 7a2 2 0 0 1 2-2h13v4'), P('M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z'), O(16.5, 14.5, 1)],
  shield: [P('M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z')],
  goal: [O(12, 12, 9), O(12, 12, 4)],
  arrowIn: [P('M17 7L7 17M7 17h8M7 17V9')],
  arrowOut: [P('M7 17L17 7M17 7H9M17 7v8')],
  down: [P('M7 7l10 10M17 17H9M17 17V9')],
  card: [R(3, 6, 18, 12, 3), P('M7 12h6')],
  swap: [P('M8 4v16M8 4L4.5 7.5M8 4l3.5 3.5M16 20V4M16 20l-3.5-3.5M16 20l3.5-3.5')],
  vault: [O(12, 12, 9), O(12, 12, 3), P('M12 3v3M12 18v3M3 12h3M18 12h3')],
  grid: [R(4, 4, 6.5, 6.5, 2.2), R(13.5, 4, 6.5, 6.5, 2.2), R(4, 13.5, 6.5, 6.5, 2.2), R(13.5, 13.5, 6.5, 6.5, 2.2)],
  bell: [P('M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z'), P('M10 20a2 2 0 0 0 4 0')],
  back: [P('M15 6l-6 6 6 6M9 12h11')],
  arrow: [P('M5 12h14M13 6l6 6-6 6')],
  minus: [P('M5 12h14')],
  user: [O(12, 8, 4), P('M4 21a8 8 0 0 1 16 0')],
  info: [O(12, 12, 9), P('M12 11v5M12 8h.01')],
  mail: [R(3, 5, 18, 14, 4), P('M4 8.5l8 5.5 8-5.5')],
  lock: [R(5, 11, 14, 10, 3.5), P('M8.5 11V8a3.5 3.5 0 0 1 7 0v3')],
  eye: [P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'), O(12, 12, 3)],
  eyeOff: [P('M3 3l18 18'), P('M10.6 6.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 4M6.5 7.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.2-1')],
  check: [P('M5 12.5l4.5 4.5L19 7.5')],
  guest: [O(12, 12, 9), O(12, 10, 3), P('M6.5 18a6 6 0 0 1 11 0')],
  google: [P('M18.4 7.6A7 7 0 1 0 19 12h-7')],
  logout: [P('M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3'), P('M16 8l4 4-4 4M20 12H9')],
};

export default function Icon({ name, size = 20, color = '#0E1B2B', strokeWidth = 2 }) {
  const parts = ICONS[name] || ICONS.dots;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {parts.map((p, i) => {
        if (p.t === 'p') return <Path key={i} d={p.d} strokeWidth={p.sw || strokeWidth} />;
        if (p.t === 'r') return <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />;
        return <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} />;
      })}
    </Svg>
  );
}
