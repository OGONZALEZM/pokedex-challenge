/**
 * 4pt spacing grid. Named tokens ordered from tightest (xxs = 4) to widest
 * (3xl = 64). Numeric values match the Figma `Spacing` variable collection
 * one-to-one. Prefer semantic tokens over hard-coded numbers throughout the app.
 */
export const spacing = {
  xxs: 4,
  xs:  8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
} as const;

export type Spacing = keyof typeof spacing;
