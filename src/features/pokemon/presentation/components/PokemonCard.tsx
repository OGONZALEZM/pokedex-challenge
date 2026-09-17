import { Image, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';
import type { PokemonSummary } from '../../domain/entities/PokemonSummary';
import { deriveGradientFromId } from '../utils/deriveGradient';

interface PokemonCardProps {
  readonly summary: PokemonSummary;
  readonly onPress: (summary: PokemonSummary) => void;
}

const CARD_WIDTH = 168;
const CARD_HEIGHT = 200;
const SPRITE_SIZE = 130;

const formatNumber = (id: number): string => `#${String(id).padStart(3, '0')}`;
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Grid card for the Pokédex list. Renders only what the summary endpoint
 * provides — id, name, sprite — so the list loads with a single API call
 * per page. The gradient background is generated deterministically from
 * the pokemon id via {@link deriveGradientFromId}: each pokemon gets a
 * unique duotone that stays stable across sessions with zero extra fetches.
 */
export const PokemonCard = ({ summary, onPress }: PokemonCardProps) => {
  const theme = useTheme();
  const [lightColor, darkColor] = deriveGradientFromId(summary.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${summary.name}, pokemon number ${summary.id}`}
      onPress={() => onPress(summary)}
      style={({ pressed }) => [
        styles.pressable,
        {
          borderRadius: theme.radii['2xl'],
          shadowColor: theme.colors.text.primary,
        },
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[lightColor, darkColor]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.card,
          { borderRadius: theme.radii['2xl'] },
        ]}
      >
        <ThemedText variant="overline" color="tertiary" style={styles.number}>
          {formatNumber(summary.id)}
        </ThemedText>
        <ThemedText variant="subtitle" color="primary" style={styles.name}>
          {capitalize(summary.name)}
        </ThemedText>

        <Image
          source={{ uri: summary.spriteUrl }}
          style={styles.sprite}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  number: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  name: {
    position: 'absolute',
    top: 30,
    left: 14,
  },
  sprite: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
});
