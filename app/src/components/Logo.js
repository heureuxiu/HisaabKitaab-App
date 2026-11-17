import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G } from 'react-native-svg';

/** The app mark: an open book with a sprout growing from the spine. bg=false draws the glyph only. */
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
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" rx={radius} fill={`url(#${id})`} />
          <Rect width="100" height="100" rx={radius} fill={`url(#${id}s)`} />
          <Rect x="0.5" y="0.5" width="99" height="99" rx={radius - 0.5} fill="none" stroke="rgba(255,255,255,0.22)" />
        </>
      ) : null}
      <G transform="translate(50 50) scale(1.06) translate(-50 -50)">
        <Path d="M50 79 C40 72 28 70 16 72 L16 51 C28 49 40 52 50 59 Z" fill="#FFFFFF" />
        <Path d="M50 79 C60 72 72 70 84 72 L84 51 C72 49 60 52 50 59 Z" fill="#FFFFFF" opacity={0.8} />
        <Path d="M50 60 V38" stroke="#E0622D" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Path d="M51 42 C51 29 61 22 74 22 C74 35 64 42 51 42 Z" fill="#E0622D" />
        <Path d="M49 48 C49 39 42 33 33 33 C33 42 40 48 49 48 Z" fill="#FF9A62" />
      </G>
    </Svg>
  );
}
