import { useCallback, useEffect, useReducer } from 'react';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { initialListState, listReducer, type PokemonListState } from '../state/PokemonListState';

const PAGE_SIZE = 20;

export interface PokemonListViewModel {
  readonly state: PokemonListState;
  readonly loadInitial: () => Promise<void>;
  readonly loadMore: () => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly retry: () => Promise<void>;
}

/**
 * ViewModel hook driving the Pokémon list screen. Encapsulates the state
 * machine, the fetch orchestration, and the pagination logic behind a small
 * action surface that the screen component consumes.
 *
 * Depends on {@link PokemonRepository} (the domain contract) rather than a
 * concrete implementation, preserving DIP so the same hook can be tested
 * against fakes without touching AsyncStorage or the network.
 */
export const usePokemonListViewModel = (repository: PokemonRepository): PokemonListViewModel => {
  const [state, dispatch] = useReducer(listReducer, initialListState);

  const loadInitial = useCallback(async () => {
    dispatch({ type: 'load/start' });
    const result = await repository.getPage(0, PAGE_SIZE);
    if (result.ok) {
      dispatch({
        type: 'load/success',
        items: result.value.items,
        nextOffset: result.value.nextOffset,
        hasMore: result.value.hasMore,
      });
    } else {
      dispatch({ type: 'load/error', error: result.error });
    }
  }, [repository]);

  const loadMore = useCallback(async () => {
    if (state.status !== 'success' || state.loadingMore || !state.hasMore || state.nextOffset === null) return;
    dispatch({ type: 'loadMore/start' });
    const result = await repository.getPage(state.nextOffset, PAGE_SIZE);
    if (result.ok) {
      dispatch({
        type: 'loadMore/success',
        items: result.value.items,
        nextOffset: result.value.nextOffset,
        hasMore: result.value.hasMore,
      });
    } else {
      dispatch({ type: 'loadMore/error' });
    }
  }, [repository, state]);

  const refresh = useCallback(async () => {
    if (state.status !== 'success' || state.revalidating) return;
    dispatch({ type: 'refresh/start' });
    const result = await repository.getPage(0, PAGE_SIZE);
    if (result.ok) {
      dispatch({
        type: 'refresh/success',
        items: result.value.items,
        nextOffset: result.value.nextOffset,
        hasMore: result.value.hasMore,
      });
    } else {
      dispatch({ type: 'refresh/error' });
    }
  }, [repository, state]);

  const retry = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return { state, loadInitial, loadMore, refresh, retry };
};
