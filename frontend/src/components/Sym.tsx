/**
 * Sym — the app's iconography, rendered as native SF Symbols (expo-symbols).
 * Pass a real SF Symbol name (e.g. "lock.fill", "flame.fill"). Weight defaults to
 * semibold to sit well next to the rounded Baloo/Nunito type. iOS-native; on Android/web
 * SymbolView renders the optional `fallback` (or nothing).
 */
import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import type { ReactNode } from 'react';
import type { OpaqueColorValue } from 'react-native';

export type SymName = SymbolViewProps['name'];

export type SymProps = {
  name: SymName;
  size?: number;
  color?: string | OpaqueColorValue;
  weight?: SymbolWeight;
  /** Multicolor / hierarchical rendering for symbols that support it. */
  type?: SymbolViewProps['type'];
  animationSpec?: SymbolViewProps['animationSpec'];
  fallback?: ReactNode;
};

export function Sym({
  name,
  size = 24,
  color,
  weight = 'semibold',
  type = 'monochrome',
  animationSpec,
  fallback,
}: SymProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      type={type}
      animationSpec={animationSpec}
      resizeMode="scaleAspectFit"
      fallback={fallback}
      style={{ width: size, height: size }}
    />
  );
}
