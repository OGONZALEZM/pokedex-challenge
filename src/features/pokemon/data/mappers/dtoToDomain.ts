import type { Pokemon, PokemonStats } from '../../domain/entities/Pokemon';
import { isPokemonType, type PokemonType } from '../../domain/enums/PokemonType';
import type { PokemonDetailDto } from '../dtos/PokemonDetailDto';

const EMPTY_STATS: PokemonStats = {
  hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0,
};

const STAT_NAME_TO_FIELD: Readonly<Record<string, keyof PokemonStats>> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

/**
 * Translates a validated {@link PokemonDetailDto} into the domain
 * {@link Pokemon} entity. Assumes structural validation has already run at
 * the boundary; domain-level constraints (known type names, canonical stat
 * names) are enforced here by filtering to the closed sets.
 */
export const mapDtoToPokemon = (dto: PokemonDetailDto): Pokemon => ({
  id: dto.id,
  name: dto.name,
  types: extractTypes(dto),
  spriteUrl: extractSpriteUrl(dto),
  height: dto.height / 10,
  weight: dto.weight / 10,
  stats: extractStats(dto),
  abilities: dto.abilities.map((a) => a.ability.name),
});

const extractTypes = (dto: PokemonDetailDto): readonly PokemonType[] => {
  const typed: PokemonType[] = [];
  for (const slot of dto.types) {
    if (isPokemonType(slot.type.name)) typed.push(slot.type.name);
  }
  return typed;
};

const extractSpriteUrl = (dto: PokemonDetailDto): string =>
  dto.sprites.other?.['official-artwork']?.front_default
    ?? dto.sprites.front_default
    ?? '';

const extractStats = (dto: PokemonDetailDto): PokemonStats => {
  const stats: Record<keyof PokemonStats, number> = { ...EMPTY_STATS };
  for (const slot of dto.stats) {
    const field = STAT_NAME_TO_FIELD[slot.stat.name];
    if (field !== undefined) stats[field] = slot.base_stat;
  }
  return stats;
};
