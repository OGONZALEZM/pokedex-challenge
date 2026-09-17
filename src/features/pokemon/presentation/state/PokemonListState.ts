import type { AppError } from '../../../../core/errors/AppError';
import type { Pokemon } from '../../domain/entities/Pokemon';

/**
 * Discriminated union modeling every legal state of the Pokémon list screen.
 * TypeScript exhaustiveness prevents impossible combinations (e.g. `error`
 * with `items` populated) at compile time — the reducer can never produce
 * an invalid transition.
 */
export type PokemonListState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: AppError }
  | {
      readonly status: 'success';
      readonly items: readonly Pokemon[];
      readonly nextOffset: number | null;
      readonly hasMore: boolean;
      readonly loadingMore: boolean;
      readonly revalidating: boolean;
    };

/**
 * Actions accepted by the list reducer. Kept flat and specific so each
 * transition is auditable in one place ({@link listReducer}).
 */
export type PokemonListAction =
  | { readonly type: 'load/start' }
  | { readonly type: 'load/success'; readonly items: readonly Pokemon[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'load/error'; readonly error: AppError }
  | { readonly type: 'loadMore/start' }
  | { readonly type: 'loadMore/success'; readonly items: readonly Pokemon[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'loadMore/error' }
  | { readonly type: 'refresh/start' }
  | { readonly type: 'refresh/success'; readonly items: readonly Pokemon[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'refresh/error' };

export const initialListState: PokemonListState = { status: 'idle' };

/**
 * Reducer that maps `(state, action)` to a new state. Pure and total —
 * unknown transitions are ignored, keeping current state intact.
 */
export const listReducer = (state: PokemonListState, action: PokemonListAction): PokemonListState => {
  switch (action.type) {
    case 'load/start':
      return { status: 'loading' };

    case 'load/success':
      return {
        status: 'success',
        items: action.items,
        nextOffset: action.nextOffset,
        hasMore: action.hasMore,
        loadingMore: false,
        revalidating: false,
      };

    case 'load/error':
      return { status: 'error', error: action.error };

    case 'loadMore/start':
      if (state.status !== 'success') return state;
      return { ...state, loadingMore: true };

    case 'loadMore/success':
      if (state.status !== 'success') return state;
      return {
        ...state,
        items: [...state.items, ...action.items],
        nextOffset: action.nextOffset,
        hasMore: action.hasMore,
        loadingMore: false,
      };

    case 'loadMore/error':
      if (state.status !== 'success') return state;
      return { ...state, loadingMore: false };

    case 'refresh/start':
      if (state.status !== 'success') return state;
      return { ...state, revalidating: true };

    case 'refresh/success':
      return {
        status: 'success',
        items: action.items,
        nextOffset: action.nextOffset,
        hasMore: action.hasMore,
        loadingMore: false,
        revalidating: false,
      };

    case 'refresh/error':
      if (state.status !== 'success') return state;
      return { ...state, revalidating: false };
  }
};
