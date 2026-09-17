/**
 * Closed set of the 18 elemental types recognized by PokéAPI (gens 1–9).
 * Modeled as a string literal union to avoid the runtime cost of a
 * TypeScript enum and to enable exhaustiveness checks in switches.
 */
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

const POKEMON_TYPES: ReadonlySet<string> = new Set<PokemonType>([
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]);

/**
 * Runtime guard for {@link PokemonType}. Enables the data layer to reject
 * unknown type names received from the API or read from persistence
 * without duplicating the closed set at each call site.
 */
export const isPokemonType = (value: unknown): value is PokemonType =>
  typeof value === 'string' && POKEMON_TYPES.has(value);
