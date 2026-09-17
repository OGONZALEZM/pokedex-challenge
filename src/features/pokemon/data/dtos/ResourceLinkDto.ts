/**
 * PokéAPI hyperlink to a referenced resource: a name plus the absolute URL
 * where the full resource can be fetched. Reused by every cross-endpoint
 * reference (types, abilities, stats, moves, …).
 *
 * Corresponds to PokéAPI's `NamedAPIResource` schema; renamed here for
 * readability while preserving the shape one-to-one.
 */
export interface ResourceLinkDto {
  readonly name: string;
  readonly url: string;
}

export const isResourceLinkDto = (value: unknown): value is ResourceLinkDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.url === 'string';
};
