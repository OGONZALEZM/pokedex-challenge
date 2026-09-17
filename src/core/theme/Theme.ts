import type { TextStyle } from 'react-native';
import type { pokemonTypeColors } from './tokens/colors';
import type { spacing } from './tokens/spacing';
import type { radii } from './tokens/radii';
import type { durations, easings } from './tokens/motion';
import type { TextVariant } from './tokens/typography';

/**
 * Semantic color roles resolved per mode (Light or Dark). Consumers bind to
 * these keys rather than raw primitives so that switching modes propagates
 * automatically through the tree.
 */
export interface SemanticColors {
  readonly background: {
    readonly canvas: string;
    readonly surface: string;
    readonly surfaceElevated: string;
    readonly inverse: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    readonly inverse: string;
    readonly onAccent: string;
  };
  readonly border: {
    readonly subtle: string;
    readonly default: string;
    readonly strong: string;
  };
  readonly accent: {
    readonly default: string;
  };
  readonly feedback: {
    readonly error: string;
    readonly success: string;
  };
}

/**
 * Complete theme contract. A theme aggregates the semantic color layer with
 * the shared token collections (typography, spacing, radii, motion, and the
 * per-Pokémon-type palette). Concrete themes ({@link lightTheme}, {@link darkTheme})
 * conform to this interface; consumers depend on the contract, never on a
 * specific theme instance.
 */
export interface Theme {
  readonly mode: 'light' | 'dark';
  readonly colors: SemanticColors;
  readonly typography: Record<TextVariant, TextStyle>;
  readonly spacing: typeof spacing;
  readonly radii: typeof radii;
  readonly motion: {
    readonly duration: typeof durations;
    readonly easing: typeof easings;
  };
  readonly pokemonType: typeof pokemonTypeColors;
}
