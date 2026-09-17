import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { initialListState, listReducer, type PokemonListState } from '../state/PokemonListState';

const PAGE_SIZE = 20;

export interface PokemonListViewModel {
  readonly state: PokemonListState;
  readonly loadMore: () => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly retry: () => Promise<void>;
}

/**
 * ViewModel hook driving the Pokémon list screen. Encapsulates the state
 * machine, fetch orchestration, and pagination logic behind a small
 * action surface that the screen component consumes.
 *
 * A `useRef` inflight lock guards every mutating action (loadMore, refresh)
 * against `FlatList.onEndReached` racing itself: React's state updates are
 * asynchronous, so multiple `onEndReached` calls within the same frame all
 * observe `state.loadingMore === false` before the first dispatch settles.
 * A synchronous ref is the classic remedy.
 *
 * Depends on {@link PokemonRepository} (the domain contract) rather than a
 * concrete implementation, preserving DIP so the same hook can be tested
 * against fakes without touching AsyncStorage or the network.
 */
export const usePokemonListViewModel = (repository: PokemonRepository): PokemonListViewModel => {
  const [state, dispatch] = useReducer(listReducer, initialListState);
  const inFlight = useRef(false);

  const loadInitial = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    dispatch({ type: 'load/start' });
    try {
      const result = await repository.getPageSummaries(0, PAGE_SIZE);
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
    } finally {
      inFlight.current = false;
    }
  }, [repository]);

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    if (state.status !== 'success' || state.loadingMore || !state.hasMore || state.nextOffset === null) return;
    inFlight.current = true;
    dispatch({ type: 'loadMore/start' });
    try {
      const result = await repository.getPageSummaries(state.nextOffset, PAGE_SIZE);
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
    } finally {
      inFlight.current = false;
    }
  }, [repository, state]);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    if (state.status !== 'success' || state.revalidating) return;
    inFlight.current = true;
    dispatch({ type: 'refresh/start' });
    try {
      const result = await repository.getPageSummaries(0, PAGE_SIZE);
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
    } finally {
      inFlight.current = false;
    }
  }, [repository, state]);

  const retry = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return { state, loadMore, refresh, retry };
};
