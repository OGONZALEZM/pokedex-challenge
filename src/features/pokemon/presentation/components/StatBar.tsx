import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';

interface StatBarProps {
  readonly label: string;
  readonly value: number;
  readonly maxValue?: number;
  readonly color?: string;
}

const MAX_DEFAULT = 255;

/**
 * Horizontal stat bar showing a value out of a scale (0–{@link maxValue}).
 * Layout: label (fixed left column) · track+fill (fills remaining) · value
 * (fixed right column). Fill width is computed as `value / maxValue` and
 * clamped between 0 and 1 to survive out-of-range inputs.
 */
export const StatBar = ({ label, value, maxValue = MAX_DEFAULT, color }: StatBarProps) => {
  const theme = useTheme();
  const ratio = Math.max(0, Math.min(1, value / maxValue));

  return (
    <View style={styles.row}>
      <ThemedText variant="bodyStrong" style={styles.label}>
        {label}
      </ThemedText>
      <View style={[styles.track, { backgroundColor: theme.colors.background.canvas }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: color ?? theme.colors.accent.default,
            },
          ]}
        />
      </View>
      <ThemedText variant="bodyStrong" color="tertiary" style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 24,
  },
  label: {
    width: 64,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  value: {
    width: 40,
    textAlign: 'right',
  },
});
