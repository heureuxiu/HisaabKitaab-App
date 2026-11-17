import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G } from 'react-native-svg';

// The Ledgero mark (a frame of two offset panels), drawn on a 100x100 grid.
const GLYPH = 'M24.85 0.00 L90.72 0.00 L90.72 85.33 L74.55 79.64 L74.25 100.00 L22.46 80.84 L9.28 14.67 L27.54 14.67 Z M31.44 17.96 L72.75 17.96 L72.75 74.85 L40.12 63.17 Z';

/** App icon style: gradient tile with the white mark. bg=false draws just the white mark. */
export default function Logo({ size = 96, bg = true, radius = 26, id = 'lg' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {bg ? (
        <>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor="#2F72DA" />
              <Stop offset="0.5" stopColor="#0A2D8C" />
              <Stop offset="1" stopColor="#02154A" />
            </LinearGradient>
            <LinearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" rx={radius} fill={`url(#${id})`} />
          <Rect width="100" height="100" rx={radius} fill={`url(#${id}s)`} />
          <G transform="translate(50 50) scale(0.56) translate(-50 -50)">
            <Path d={GLYPH} fill="#FFFFFF" fillRule="evenodd" />
          </G>
        </>
      ) : (
        <Path d={GLYPH} fill="#FFFFFF" fillRule="evenodd" />
      )}
    </Svg>
  );
}

/** The mark on its own, in the brand blue gradient (or one flat colour). Used next to the name on white screens. */
export function LogoMark({ size = 34, id = 'lm', color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {color ? null : (
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#2B6BD0" />
            <Stop offset="0.5" stopColor="#0A2D8C" />
            <Stop offset="1" stopColor="#02154A" />
          </LinearGradient>
        </Defs>
      )}
      <Path d={GLYPH} fill={color || `url(#${id})`} fillRule="evenodd" />
    </Svg>
  );
}
