import type { PokemonSpeciesDto } from '../dtos/PokemonSpeciesDto';

/**
 * Extracts the first English flavor text entry and normalizes its
 * whitespace. PokéAPI's flavor text ships with literal `\n` and form-feed
 * (`\f`) characters used to break lines on the original hardware — the
 * mobile app should render it as a single flowing paragraph.
 *
 * Returns `undefined` when no English entry exists so the caller can
 * decide whether to omit the description field entirely.
 */
export const extractEnglishFlavor = (dto: PokemonSpeciesDto): string | undefined => {
  const entry = dto.flavor_text_entries.find((e) => e.language.name === 'en');
  if (entry === undefined) return undefined;
  return entry.flavor_text.replace(/[\n\f\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
};
