import { useCallback, useEffect, useReducer } from 'react';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { detailReducer, initialDetailState, type PokemonDetailState } from '../state/PokemonDetailState';

export interface PokemonDetailViewModel {
  readonly state: PokemonDetailState;
  readonly retry: () => Promise<void>;
}

/**
 * ViewModel hook for the Pokémon detail screen. Fetches the pokemon by id
 * on mount and whenever the id changes; exposes a `retry` action so the
 * error state has a recovery path.
 */
export const usePokemonDetailViewModel = (
  repository: PokemonRepository,
  id: number,
): PokemonDetailViewModel => {
  const [state, dispatch] = useReducer(detailReducer, initialDetailState);

  const load = useCallback(async () => {
    dispatch({ type: 'load/start' });
    const result = await repository.getById(id);
    if (result.ok) {
      dispatch({ type: 'load/success', pokemon: result.value });
    } else {
      dispatch({ type: 'load/error', error: result.error });
    }
  }, [repository, id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, retry: load };
};
