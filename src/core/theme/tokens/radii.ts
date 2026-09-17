/**
 * Corner radius scale mirrored from the Figma `Radius` variable collection.
 * `full` (999) collapses to a pill or perfect circle depending on the shape's
 * aspect ratio, matching web `border-radius: 9999px` semantics.
 */
export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 999,
} as const;

export type Radius = keyof typeof radii;
