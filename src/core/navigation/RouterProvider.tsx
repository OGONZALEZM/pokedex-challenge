import { createContext, type ReactNode } from 'react';
import type { Route } from './Route';
import type { Router } from './Router';
import { useStackRouter } from './StackRouter';

/**
 * Context handle for the active {@link Router}. Exported for consumption
 * by {@link useRouter}; components must not read from it directly.
 * `null` while outside a provider so the hook can throw a helpful error.
 */
export const RouterContext = createContext<Router | null>(null);

interface RouterProviderProps {
  readonly initial: Route;
  readonly children: ReactNode;
}

/**
 * Mounts a {@link useStackRouter} at the composition root and publishes it
 * through {@link RouterContext} so any descendant can call
 * {@link useRouter} to navigate.
 */
export const RouterProvider = ({ initial, children }: RouterProviderProps) => {
  const router = useStackRouter(initial);
  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
};
