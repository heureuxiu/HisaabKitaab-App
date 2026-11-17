// Colours and type taken 1:1 from the v2 design boards (light theme only).
export const C = {
  ink: '#0B1220', muted: '#6B7788', soft: '#EDF0F4', white: '#FFFFFF',
  navy: '#0A2D8C', orange: '#E0622D', green: '#0B7A4B', blue: '#2158D6',
  line: '#DDE3EC',
  gradient: ['#02154A', '#0A2D8C', '#2B6BD0'],
  gradientAt: [0, 0.52, 1],
  glass: 'rgba(255,255,255,0.14)', glassLine: 'rgba(255,255,255,0.18)',
  onDark: 'rgba(255,255,255,0.72)', onDarkSoft: 'rgba(255,255,255,0.6)',
  tileIcon: '#4A5568',
};

const FAMILY = {
  400: 'InterTight_400Regular',
  500: 'InterTight_500Medium',
  600: 'InterTight_600SemiBold',
  700: 'InterTight_700Bold',
};

/** Text style: size, weight (400-700), optional extras. Numbers use tabular figures like the design. */
export const T = (size, weight = 500, extra) => ({
  fontFamily: FAMILY[weight] || FAMILY[500],
  fontSize: size,
  fontVariant: ['tabular-nums'],
  ...extra,
});

/** Amount colour in lists: income green, savings blue, expense plain ink (as in the design). */
export const typeColor = (type) => (type === 'income' ? C.green : type === 'savings' ? C.blue : C.ink);
