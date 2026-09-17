/**
 * Domain entity representing a Pokémon.
 */
export interface Pokemon {
  readonly id: number;
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly spriteUrl: string;
  readonly height: number;
  readonly weight: number;
  readonly stats: PokemonStats;
  readonly abilities: readonly string[];
}

/**
 * Closed set of the 18 elemental types recognized by PokéAPI
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

/**
 * Base stats of a Pokémon.
 */
export interface PokemonStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}
