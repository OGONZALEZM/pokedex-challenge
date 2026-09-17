import type { PokemonType } from '../enums/PokemonType';

/**
 * Domain entity representing a Pokémon.
 * Units are normalized at the mapper boundary: `height` in meters,
 * `weight` in kilograms. All collections are `readonly` to enforce
 * immutability across the app.
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
 * Base stats of a Pokémon, keyed by canonical PokéAPI stat name in camelCase.
 */
export interface PokemonStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}
