import { Easing, type EasingFunction } from 'react-native';

/**
 * Animation duration scale (milliseconds). Mirrored from the Figma `Motion`
 * variable collection. Use `pokeball` for the branded loading transition;
 * `fast`/`base`/`slow` cover general micro-interactions.
 */
export const durations = {
  fast:     150,
  base:     250,
  slow:     400,
  pokeball: 800,
} as const;

/**
 * Named easing curves. React Native's `Easing.bezier` produces the same
 * cubic-bezier semantics as the CSS values used in the Figma tokens, keeping
 * motion consistent across design and runtime.
 */
export const easings = {
  standard:    Easing.bezier(0.4, 0, 0.2, 1),
  decelerate:  Easing.bezier(0, 0, 0.2, 1),
  accelerate:  Easing.bezier(0.4, 0, 1, 1),
  emphasized:  Easing.bezier(0.2, 0, 0, 1),
} as const satisfies Record<string, EasingFunction>;

export type Duration = keyof typeof durations;
export type EasingName = keyof typeof easings;
