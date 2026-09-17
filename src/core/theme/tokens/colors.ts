/**
 * Primitive color palette — raw values sourced 1:1 from the Figma design system.
 * These are not meant to be consumed directly by components; consumers should
 * bind to semantic tokens defined in {@link Theme.colors}, which alias into
 * this palette and adapt across light/dark modes.
 */
export const primitives = {
  neutral: {
    0:   '#FFFFFF',
    50:  '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  brand: {
    500: '#E4374A',
  },
  error: {
    100: '#FEE2E2',
    500: '#EF4444',
  },
  success: {
    100: '#DCFCE7',
    500: '#22C55E',
  },
  warning: {
    500: '#F59E0B',
  },
} as const;

/**
 * Duotone palette per Pokémon elemental type.
 * `light` powers surface backgrounds and gradient starts, `primary` powers
 * chips and mid-tones, `dark` powers gradient ends and high-contrast accents.
 * Values are the modern reinterpretation locked in the design system —
 * intentionally softer and more saturated than Bulbapedia canonical colors.
 */
export const pokemonTypeColors = {
  normal:   { light: '#E5E7EB', primary: '#94A3B8', dark: '#475569' },
  fire:     { light: '#FED7AA', primary: '#F97316', dark: '#C2410C' },
  water:    { light: '#BFDBFE', primary: '#3B82F6', dark: '#1D4ED8' },
  electric: { light: '#FEF3C7', primary: '#EAB308', dark: '#A16207' },
  grass:    { light: '#BBF7D0', primary: '#22C55E', dark: '#15803D' },
  ice:      { light: '#CFFAFE', primary: '#06B6D4', dark: '#0E7490' },
  fighting: { light: '#FECDD3', primary: '#E11D48', dark: '#9F1239' },
  poison:   { light: '#DDD6FE', primary: '#8B5CF6', dark: '#6D28D9' },
  ground:   { light: '#FDE68A', primary: '#D97706', dark: '#92400E' },
  flying:   { light: '#DBEAFE', primary: '#60A5FA', dark: '#2563EB' },
  psychic:  { light: '#FBCFE8', primary: '#EC4899', dark: '#BE185D' },
  bug:      { light: '#DCFCE7', primary: '#84CC16', dark: '#4D7C0F' },
  rock:     { light: '#E7E5E4', primary: '#A8A29E', dark: '#57534E' },
  ghost:    { light: '#E9D5FF', primary: '#A855F7', dark: '#7E22CE' },
  dragon:   { light: '#C7D2FE', primary: '#6366F1', dark: '#4338CA' },
  dark:     { light: '#D6D3D1', primary: '#57534E', dark: '#292524' },
  steel:    { light: '#E4E4E7', primary: '#71717A', dark: '#3F3F46' },
  fairy:    { light: '#FCE7F3', primary: '#F472B6', dark: '#DB2777' },
} as const;
