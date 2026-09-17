import { Fragment, type ReactNode } from 'react';
import type { Route } from './Route';
import { useRouter } from './useRouter';

/**
 * Route-to-renderer map. The mapped-type conditional forces callers to
 * provide a renderer for every {@link Route} variant — omitting one is a
 * compile-time error, and each renderer receives its exact route type
 * (payload fields narrowed automatically).
 */
export type RouteRenderers = {
  readonly [K in Route['name']]: (route: Extract<Route, { name: K }>) => ReactNode;
};

interface RouterOutletProps {
  readonly routes: RouteRenderers;
}

/**
 * Renders the screen matching the current route. Sits once near the
 * composition root under {@link RouterProvider}. Adding a new route
 * variant to {@link Route} produces a compile error here until its
 * renderer is added — no runtime blank screens for missing routes.
 */
export const RouterOutlet = ({ routes }: RouterOutletProps) => {
  const router = useRouter();
  const current = router.current;
  // Runtime dispatch by discriminant. The cast is confined here; the
  // public `routes` map remains fully type-checked.
  const dispatch = routes as Record<Route['name'], (route: Route) => ReactNode>;
  return <Fragment>{dispatch[current.name](current)}</Fragment>;
};
