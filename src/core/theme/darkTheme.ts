import { primitives, pokemonTypeColors } from './tokens/colors';
import { textStyles } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { radii } from './tokens/radii';
import { durations, easings } from './tokens/motion';
import type { Theme } from './Theme';

/**
 * Dark mode theme. Semantic colors invert the neutral scale relative to
 * {@link lightTheme}. Accent and feedback colors stay identical between
 * modes because the brand identity does not shift with the color scheme.
 */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      canvas:          primitives.neutral[950],
      surface:         primitives.neutral[900],
      surfaceElevated: primitives.neutral[800],
      inverse:         primitives.neutral[50],
    },
    text: {
      primary:   primitives.neutral[50],
      secondary: primitives.neutral[400],
      tertiary:  primitives.neutral[500],
      inverse:   primitives.neutral[900],
      onAccent:  primitives.neutral[0],
    },
    border: {
      subtle:  primitives.neutral[900],
      default: primitives.neutral[800],
      strong:  primitives.neutral[700],
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
