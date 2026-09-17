import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';

interface TabProps {
  readonly label: string;
  readonly active: boolean;
  readonly onPress: () => void;
}

/**
 * Single tab used inside a tab bar.
 */
export const Tab = ({ label, active, onPress }: TabProps) => {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <ThemedText variant="bodyStrong" color={active ? 'primary' : 'tertiary'}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.underline,
          { backgroundColor: active ? theme.colors.accent.default : 'transparent' },
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  underline: {
    height: 2,
    alignSelf: 'stretch',
    borderRadius: 999,
    marginHorizontal: 16,
  },
});
