import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
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

const keyFor = (route: Route, index: number): string => {
  if (route.name === 'pokemonDetail') return `${route.name}:${route.summary.id}:${index}`;
  return `${route.name}:${index}`;
};

/**
 * Renders the entire route stack with keep-alive semantics: every screen
 * that has been navigated to remains mounted, only the top is visible and
 * interactive. Popping the top restores the underlying screen with all its
 * local state intact (list scroll position, viewmodel data, form inputs).
 *
 * The top screen fades in on mount to soften the transition — a light
 * touch that avoids the abruptness of an instant swap without introducing
 * a full gesture-driven navigation stack.
 *
 * Adding a new {@link Route} variant produces a compile error on the
 * `routes` prop until its renderer is added, so orphan routes cannot ship.
 */
export const RouterOutlet = ({ routes }: RouterOutletProps) => {
  const router = useRouter();
  const dispatch = routes as Record<Route['name'], (route: Route) => ReactNode>;

  return (
    <View style={styles.container}>
      {router.stack.map((route, index) => {
        const isTop = index === router.stack.length - 1;
        return (
          <ScreenSlot key={keyFor(route, index)} isTop={isTop}>
            {dispatch[route.name](route)}
          </ScreenSlot>
        );
      })}
    </View>
  );
};

interface ScreenSlotProps {
  readonly isTop: boolean;
  readonly children: ReactNode;
}

/**
 * Wraps a single screen. Only the top slot is visible and receives touch
 * events; hidden slots stay mounted so their state survives navigation.
 * A brief fade-in on mount provides a subtle entrance cue.
 */
const ScreenSlot = ({ isTop, children }: ScreenSlotProps) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: theme.motion.duration.base,
      easing: theme.motion.easing.decelerate,
      useNativeDriver: true,
    }).start();
  }, [opacity, theme]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        isTop ? { opacity } : styles.hidden,
      ]}
      pointerEvents={isTop ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
