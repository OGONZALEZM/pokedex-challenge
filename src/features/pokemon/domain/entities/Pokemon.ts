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
  /**
   * Flavor text pulled from the `/pokemon-species/{id}` endpoint. Optional
   * because that call is best-effort — the pokemon renders without it if
   * the species request fails or has no English entry.
   */
  readonly description?: string;
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
