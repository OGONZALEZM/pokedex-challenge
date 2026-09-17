import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonPage } from '../../domain/entities/PokemonPage';
import type { StoredPokemon } from '../records/StoredPokemon';
import type { StoredPage } from '../records/StoredPage';

/**
 * Serializes a domain {@link Pokemon} into its persistence form.
 * The transformation is total because the record shape is a structural
 * projection of the domain entity.
 */
export const mapPokemonToStored = (pokemon: Pokemon): StoredPokemon => ({
  id: pokemon.id,
  name: pokemon.name,
  types: pokemon.types,
  spriteUrl: pokemon.spriteUrl,
  height: pokemon.height,
  weight: pokemon.weight,
  stats: pokemon.stats,
  abilities: pokemon.abilities,
});

/**
 * Serializes a domain {@link PokemonPage} into its persistence form.
 * `hasMore` is intentionally discarded because it is derivable from
 * `nextOffset` on read; storing it would introduce redundant state.
 */
export const mapPokemonPageToStored = (page: PokemonPage): StoredPage => ({
  items: page.items.map(mapPokemonToStored),
  nextOffset: page.nextOffset,
});
