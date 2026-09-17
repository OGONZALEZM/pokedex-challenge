import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { Theme } from '../theme/Theme';
import type { TextVariant } from '../theme/tokens/typography';

type TextColor = keyof Theme['colors']['text'];

interface ThemedTextProps extends TextProps {
  /**
   * Typography variant from the design system scale. Determines fontSize,
   * lineHeight, weight, letterSpacing, and text transform.
   */
  readonly variant?: TextVariant;
  /**
   * Semantic text color role. Defaults to `primary` for maximum legibility.
   */
  readonly color?: TextColor;
}

/**
 * Text component wired to the design system. Every text node in the app
 * should render through this primitive rather than importing `Text` from
 * `react-native` directly, guaranteeing typography and color consistency.
 *
 * User-supplied `style` overrides win over the resolved variant/color so
 * one-off adjustments remain possible without forking the component.
 */
export const ThemedText = ({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: ThemedTextProps) => {
  const theme = useTheme();
  return (
    <Text
      {...rest}
      style={[
        theme.typography[variant],
        { color: theme.colors.text[color] },
        style,
      ]}
    />
  );
};
