import type { Route } from './Route';

/**
 * Application-facing navigation contract.
 *
 * Screens depend on this interface, never on a concrete implementation.
 * Swapping {@link StackRouter} for another strategy (memory router for
 * tests, deep-link-aware router, animated stack) is a composition-root
 * change — consumers are untouched.
 */
export interface Router {
  /**
   * Full route stack from bottom (oldest) to top (current). Exposed so the
   * outlet can keep-alive every mounted screen and preserve state across
   * navigation — the same guarantee React Navigation offers by default.
   */
  readonly stack: readonly Route[];
  /** Route currently rendered at the top of the stack. */
  readonly current: Route;
  /** `true` when a previous route exists and `goBack()` will succeed. */
  readonly canGoBack: boolean;
  /** Pushes a new route on top of the stack. */
  navigate(route: Route): void;
  /** Pops the top route. No-op when `canGoBack` is `false`. */
  goBack(): void;
  /** Replaces the entire stack with a single route. Use for deep links and sign-out flows. */
  reset(route: Route): void;
}
