import { isResourceLinkDto, type ResourceLinkDto } from './ResourceLinkDto';

/**
 * Slice of the `/pokemon-species/{id}` response consumed by the app.
 * Only `flavor_text_entries` is modeled — that's where the localized
 * description text lives. Every additional PokéAPI field is intentionally
 * ignored to keep the boundary tight.
 */
export interface PokemonSpeciesDto {
  readonly flavor_text_entries: readonly FlavorTextEntryDto[];
}

export interface FlavorTextEntryDto {
  readonly flavor_text: string;
  readonly language: ResourceLinkDto;
  readonly version: ResourceLinkDto;
}

const isFlavorTextEntry = (value: unknown): value is FlavorTextEntryDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.flavor_text === 'string'
    && isResourceLinkDto(v.language)
    && isResourceLinkDto(v.version);
};

export const isPokemonSpeciesDto = (value: unknown): value is PokemonSpeciesDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.flavor_text_entries)
    && v.flavor_text_entries.every(isFlavorTextEntry);
};
