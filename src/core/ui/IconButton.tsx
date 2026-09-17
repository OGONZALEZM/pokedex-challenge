import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type IconButtonVariant = 'filled' | 'ghost';
type IconButtonSize = 'sm' | 'md';

interface IconButtonProps {
  /**
   * Icon glyph. Accepts any string
   */
  readonly icon: string;
  readonly onPress: () => void;
  /**
   * Required for accessibility. Screen readers announce this label; the
   * icon glyph is invisible to assistive technology.
   */
  readonly accessibilityLabel: string;
  readonly variant?: IconButtonVariant;
  readonly size?: IconButtonSize;
  readonly style?: ViewStyle;
  readonly iconColor?: string;
}

const SIZES: Record<IconButtonSize, { readonly box: number; readonly icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 44, icon: 22 },
};

/**
 * Circular pressable button that hosts a single icon glyph. Two visual
 * variants map to the Figma design system: `filled` uses the accent color
 * for high-emphasis primary actions; `ghost` is transparent with a subtle
 * border for secondary actions and overlay contexts.
 *
 * `size=md` meets the iOS 44pt minimum touch target; `size=sm` is reserved
 * for compact layouts where touch area is guaranteed by surrounding padding.
 */
export const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'filled',
  size = 'md',
  style,
  iconColor,
}: IconButtonProps) => {
  const theme = useTheme();
  const { box, icon: iconSize } = SIZES[size];

  const baseStyle: ViewStyle = {
    width: box,
    height: box,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const variantStyle: ViewStyle = variant === 'filled'
    ? { backgroundColor: theme.colors.accent.default }
    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border.default };

  const defaultIconColor = variant === 'filled'
    ? theme.colors.text.onAccent
    : theme.colors.text.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        baseStyle,
        variantStyle,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontSize: iconSize,
          lineHeight: iconSize,
          fontFamily: theme.typography.bodyStrong.fontFamily,
          fontWeight: '700',
          color: iconColor ?? defaultIconColor,
        }}
      >
        {icon}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
});
