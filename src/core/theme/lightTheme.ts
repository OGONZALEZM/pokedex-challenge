import { primitives, pokemonTypeColors } from './tokens/colors';
import { textStyles } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { radii } from './tokens/radii';
import { durations, easings } from './tokens/motion';
import type { Theme } from './Theme';

/**
 * Light mode theme. Semantic colors resolve to the light end of the neutral
 * scale for backgrounds and the dark end for text, matching the Figma
 * `Color` variable collection's Light mode one-to-one.
 */
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      canvas:          primitives.neutral[50],
      surface:         primitives.neutral[0],
      surfaceElevated: primitives.neutral[0],
      inverse:         primitives.neutral[900],
    },
    text: {
      primary:   primitives.neutral[900],
      secondary: primitives.neutral[600],
      tertiary:  primitives.neutral[500],
      inverse:   primitives.neutral[0],
      onAccent:  primitives.neutral[0],
    },
    border: {
      subtle:  primitives.neutral[100],
      default: primitives.neutral[200],
      strong:  primitives.neutral[300],
    },
    accent: {
      default: primitives.brand[500],
    },
    feedback: {
      error:   primitives.error[500],
      success: primitives.success[500],
    },
  },
  typography: textStyles,
  spacing,
  radii,
  motion: { duration: durations, easing: easings },
  pokemonType: pokemonTypeColors,
};
