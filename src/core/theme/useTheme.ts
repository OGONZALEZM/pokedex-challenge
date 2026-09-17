import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { Theme } from './Theme';

/**
 * Hook that returns the active {@link Theme} from the nearest
 * {@link ThemeProvider}. Preferred entry point for any component that needs
 * theme tokens — components never import concrete themes directly.
 */
export const useTheme = (): Theme => useContext(ThemeContext);
