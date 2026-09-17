/**
 * Deterministic duotone gradient derived from a Pokémon's numeric id.
 *
 * Each id maps to a unique hue via the golden angle (`137.508°`), the
 * standard trick for generating visually distinct colors with even
 * perceptual spacing — neighbours in the grid never look alike, and the
 * function is a pure mapping so the same pokemon always renders the same
 * gradient (no cache needed).
 *
 * This is a pragmatic substitute for extracting the dominant colors from
 * the sprite bitmap itself — that route requires a native library the
 * project constraint disallows. Trade-off: colors are visually diverse
 * and stable but do not reflect the pokemon's canonical palette.
 */
export const deriveGradientFromId = (id: number): readonly [string, string] => {
  const hue = ((id * 137.508) % 360 + 360) % 360;
  // Soft duotone: very light top → medium mid-tone bottom. Both stops share
  // the hue so the gradient reads as a single color's depth, not two hues.
  // Saturations are moderate to keep it pastel rather than punchy.
  const soft = hslToHex(hue, 42, 93);
  const medium = hslToHex(hue, 55, 62);
  return [soft, medium];
};

/**
 * Standard HSL → HEX conversion. Extracted so callers get an RGB string
 * consumable by any React Native fill (LinearGradient stops, backgroundColor,
 * borderColor, etc.).
 */
const hslToHex = (h: number, s: number, l: number): string => {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = lN - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 1)      { r = c; g = x; }
  else if (hh < 2) { r = x; g = c; }
  else if (hh < 3) {        g = c; b = x; }
  else if (hh < 4) {        g = x; b = c; }
  else if (hh < 5) { r = x;        b = c; }
  else             { r = c;        b = x; }

  const toHex = (v: number): string =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
