import { useCallback, useMemo, useReducer } from 'react';
import type { Route } from './Route';
import type { Router } from './Router';

type StackAction =
  | { readonly type: 'push'; readonly route: Route }
  | { readonly type: 'pop' }
  | { readonly type: 'reset'; readonly route: Route };

const reducer = (stack: readonly Route[], action: StackAction): readonly Route[] => {
  switch (action.type) {
    case 'push':
      return [...stack, action.route];
    case 'pop':
      return stack.length > 1 ? stack.slice(0, -1) : stack;
    case 'reset':
      return [action.route];
  }
};

/**
 * Stack-based implementation of {@link Router}. Backed by `useReducer` so
 * every transition is a pure mapping from `(stack, action)` to a new stack;
 * the reducer is trivially testable in isolation from React.
 *
 * The current route is the top of the stack; `goBack` pops it. When only
 * one entry remains, `goBack` becomes a no-op and `canGoBack` reflects it.
 */
export const useStackRouter = (initial: Route): Router => {
  const [stack, dispatch] = useReducer(reducer, [initial]);

  const navigate = useCallback((route: Route) => dispatch({ type: 'push', route }), []);
  const goBack = useCallback(() => dispatch({ type: 'pop' }), []);
  const reset = useCallback((route: Route) => dispatch({ type: 'reset', route }), []);

  return useMemo<Router>(
    () => ({
      current: stack[stack.length - 1] ?? initial,
      canGoBack: stack.length > 1,
      navigate,
      goBack,
      reset,
    }),
    [stack, initial, navigate, goBack, reset],
  );
};
