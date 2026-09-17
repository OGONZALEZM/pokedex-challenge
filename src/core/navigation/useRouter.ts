import { useContext } from 'react';
import type { Router } from './Router';
import { RouterContext } from './RouterProvider';

/**
 * Hook returning the active {@link Router}. Throws when used outside of a
 * {@link RouterProvider} — surfacing wiring bugs at first render rather
 * than as silent no-op navigation.
 */
export const useRouter = (): Router => {
  const router = useContext(RouterContext);
  if (router === null) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return router;
};
