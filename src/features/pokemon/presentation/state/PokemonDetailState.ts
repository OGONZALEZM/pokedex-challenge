import type { AppError } from '../../../../core/errors/AppError';
import type { Pokemon } from '../../domain/entities/Pokemon';

/**
 * Discriminated union modeling the async lifecycle of a single Pokémon
 * detail fetch. The UI-only tab selection is intentionally kept out of this
 * state machine — it belongs to local screen state, not to the domain data
 * lifecycle.
 */
export type PokemonDetailState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: AppError }
  | { readonly status: 'success'; readonly pokemon: Pokemon };

export type PokemonDetailAction =
  | { readonly type: 'load/start' }
  | { readonly type: 'load/success'; readonly pokemon: Pokemon }
  | { readonly type: 'load/error'; readonly error: AppError };

export const initialDetailState: PokemonDetailState = { status: 'idle' };

export const detailReducer = (
  _state: PokemonDetailState,
  action: PokemonDetailAction,
): PokemonDetailState => {
  switch (action.type) {
    case 'load/start':
      return { status: 'loading' };
    case 'load/success':
      return { status: 'success', pokemon: action.pokemon };
    case 'load/error':
      return { status: 'error', error: action.error };
  }
};
