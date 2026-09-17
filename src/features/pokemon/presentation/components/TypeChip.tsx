import { View, type ViewStyle } from 'react-native';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';
import type { PokemonType } from '../../domain/enums/PokemonType';

interface TypeChipProps {
  readonly type: PokemonType;
  readonly style?: ViewStyle;
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Pokemon type badge. Duotone styling using the type's `light` background
 * (at 80% opacity for a glass effect on colored surfaces) and `dark` text.
 * Sized as a compact pill so two chips fit side by side inside a
 * {@link PokemonCard}.
 */
export const TypeChip = ({ type, style }: TypeChipProps) => {
  const theme = useTheme();
  const palette = theme.pokemonType[type];

  return (
    <View
      style={[
        {
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radii.full,
          backgroundColor: `${palette.light}CC`,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <ThemedText variant="overline" style={{ color: palette.dark }}>
        {capitalize(type)}
      </ThemedText>
    </View>
  );
};
