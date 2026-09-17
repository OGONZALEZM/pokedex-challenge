import type { TextStyle } from 'react-native';

/**
 * Font family primitive. React Native resolves the exact font file via the
 * platform's font manager (iOS: Info.plist, Android: assets/fonts/). Ensure
 * DM Sans is bundled and registered before the app renders text.
 */
export const fontFamily = 'DM Sans' as const;

/**
 * DM Sans typography scale mirrored 1:1 from the Figma design system.
 * Each entry is a valid `TextStyle` slice suitable for spreading into a
 * component's style prop.
 */
export const textStyles = {
  display:     { fontFamily, fontSize: 40, lineHeight: 48, fontWeight: '700' },
  title:       { fontFamily, fontSize: 28, lineHeight: 36, fontWeight: '700' },
  heading:     { fontFamily, fontSize: 22, lineHeight: 28, fontWeight: '600' },
  subtitle:    { fontFamily, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body:        { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong:  { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption:     { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline:    { fontFamily, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;
