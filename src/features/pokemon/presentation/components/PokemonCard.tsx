import { Image, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Pokemon } from '../../domain/entities/Pokemon';
import { TypeChip } from './TypeChip';

interface PokemonCardProps {
  readonly pokemon: Pokemon;
  readonly onPress: (id: number) => void;
}

const CARD_WIDTH = 168;
const CARD_HEIGHT = 224;
const SPRITE_SIZE = 140;

const formatNumber = (id: number): string => `#${String(id).padStart(3, '0')}`;

/**
 * Grid card for the Pokédex list. The gradient is derived from the pokemon's
 * primary type — `type/light` → `type/dark` top-to-bottom — so each card
 * carries its own visual identity while remaining coherent with the system.
 *
 * The sprite is anchored bottom-right and clipped by the card's rounded
 * corners, mirroring the "sprite floating over gradient" pattern from the
 * Figma design. Tapping the card fires `onPress` with the pokemon id.
 */
export const PokemonCard = ({ pokemon, onPress }: PokemonCardProps) => {
  const theme = useTheme();
  const primaryType = pokemon.types[0] ?? 'normal';
  const palette = theme.pokemonType[primaryType];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pokemon.name}, pokemon number ${pokemon.id}`}
      onPress={() => onPress(pokemon.id)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[palette.light, palette.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.card,
          {
            borderRadius: theme.radii['2xl'],
            shadowColor: theme.colors.text.primary,
          },
        ]}
      >
        <ThemedText variant="overline" color="secondary" style={styles.number}>
          {formatNumber(pokemon.id)}
        </ThemedText>
        <ThemedText variant="subtitle" color="primary" style={styles.name}>
          {pokemon.name}
        </ThemedText>

        {pokemon.spriteUrl.length > 0 && (
          <Image
            source={{ uri: pokemon.spriteUrl }}
            style={styles.sprite}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        )}

        <View style={styles.chips}>
          {pokemon.types.map((type) => (
            <TypeChip key={type} type={type} />
          ))}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    right: -12,
    bottom: -4,
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
  chips: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
  },
});
