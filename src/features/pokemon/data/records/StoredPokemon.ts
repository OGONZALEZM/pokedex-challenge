import { isPokemonType, type PokemonType } from '../../domain/enums/PokemonType';

/**
 * Persistence contract for a single Pokémon. Kept structurally independent
 * from the domain {@link Pokemon} entity so that changes to the domain do
 * not silently alter the on-disk format. Any breaking change to this shape
 * requires a bump of the {@link JsonCache} `schemaVersion`.
 */
export interface StoredPokemon {
  readonly id: number;
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly spriteUrl: string;
  readonly height: number;
  readonly weight: number;
  readonly stats: StoredPokemonStats;
  readonly abilities: readonly string[];
}

export interface StoredPokemonStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}

const isStoredStats = (value: unknown): value is StoredPokemonStats => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.hp === 'number'
    && typeof v.attack === 'number'
    && typeof v.defense === 'number'
    && typeof v.specialAttack === 'number'
    && typeof v.specialDefense === 'number'
    && typeof v.speed === 'number';
};

export const isStoredPokemon = (value: unknown): value is StoredPokemon => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'number'
    && typeof v.name === 'string'
    && Array.isArray(v.types) && v.types.every(isPokemonType)
    && typeof v.spriteUrl === 'string'
    && typeof v.height === 'number'
    && typeof v.weight === 'number'
    && isStoredStats(v.stats)
    && Array.isArray(v.abilities) && v.abilities.every((a) => typeof a === 'string');
};
