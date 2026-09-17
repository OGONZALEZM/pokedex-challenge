import type { AppError } from '../../../../core/errors/AppError';
import type { PokemonSummary } from '../../domain/entities/PokemonSummary';

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
      readonly items: readonly PokemonSummary[];
      readonly nextOffset: number | null;
      readonly hasMore: boolean;
      readonly loadingMore: boolean;
      readonly revalidating: boolean;
    };

export type PokemonListAction =
  | { readonly type: 'load/start' }
  | { readonly type: 'load/success'; readonly items: readonly PokemonSummary[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'load/error'; readonly error: AppError }
  | { readonly type: 'loadMore/start' }
  | { readonly type: 'loadMore/success'; readonly items: readonly PokemonSummary[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'loadMore/error' }
  | { readonly type: 'refresh/start' }
  | { readonly type: 'refresh/success'; readonly items: readonly PokemonSummary[]; readonly nextOffset: number | null; readonly hasMore: boolean }
  | { readonly type: 'refresh/error' };

export const initialListState: PokemonListState = { status: 'idle' };

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

    case 'loadMore/success': {
      if (state.status !== 'success') return state;
      // Dedup on id — defensive belt for the case where a race condition or
      // an overlapping page write slips past the inflight lock.
      const seen = new Set(state.items.map((p) => p.id));
      const merged = [...state.items];
      for (const item of action.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          merged.push(item);
        }
      }
      return {
        ...state,
        items: merged,
        nextOffset: action.nextOffset,
        hasMore: action.hasMore,
        loadingMore: false,
      };
    }

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
