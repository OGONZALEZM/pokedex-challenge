import React, { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { Theme } from './Theme';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

/**
 * Context handle for the current {@link Theme}. Exported for consumption by
 * {@link useTheme}; components should never read from this directly.
 */
export const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  readonly children: ReactNode;
  /**
   * Forces a specific theme regardless of the platform color scheme.
   * Intended for tests, previews, and screenshots. In production the
   * provider follows `useColorScheme` automatically.
   */
  readonly override?: Theme;
}

/**
 * Application-level theme provider. Selects between {@link lightTheme} and
 * {@link darkTheme} based on the platform color scheme reported by
 * React Native's `useColorScheme` hook. Mounts once at the composition root.
 */
export const ThemeProvider = ({ children, override }: ThemeProviderProps) => {
  const scheme = useColorScheme();
  const value = useMemo<Theme>(
    () => override ?? (scheme === 'dark' ? darkTheme : lightTheme),
    [override, scheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
