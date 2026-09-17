import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { IconButton } from '../../../../core/ui/IconButton';
import { PokeballSpinner } from '../../../../core/ui/PokeballSpinner';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Theme } from '../../../../core/theme/Theme';
import type { Pokemon, PokemonStats } from '../../domain/entities/Pokemon';
import type { PokemonSummary } from '../../domain/entities/PokemonSummary';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { TypeChip } from '../components/TypeChip';
import { StatBar } from '../components/StatBar';
import { Tab } from '../components/Tab';
import { usePokemonDetailViewModel } from '../viewmodels/usePokemonDetailViewModel';

interface PokemonDetailScreenProps {
  readonly repository: PokemonRepository;
  readonly summary: PokemonSummary;
  readonly onBack: () => void;
}

type ActiveTab = 'about' | 'stats' | 'evolution' | 'moves';
const TABS: readonly { readonly key: ActiveTab; readonly label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'stats', label: 'Stats' },
  { key: 'evolution', label: 'Evolution' },
  { key: 'moves', label: 'Moves' },
];

const STAT_ORDER: readonly { readonly key: keyof PokemonStats; readonly label: string }[] = [
  { key: 'hp',              label: 'HP' },
  { key: 'attack',          label: 'Attack' },
  { key: 'defense',         label: 'Defense' },
  { key: 'specialAttack',   label: 'Sp. Atk' },
  { key: 'specialDefense',  label: 'Sp. Def' },
  { key: 'speed',           label: 'Speed' },
];

const formatNumber = (id: number): string => `#${String(id).padStart(3, '0')}`;
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const statsTotal = (s: PokemonStats): number =>
  s.hp + s.attack + s.defense + s.specialAttack + s.specialDefense + s.speed;

/**
 * "Home" render is a stylized 3D depiction that differs from the flat
 * official-artwork used on the list card, giving the detail screen a
 * distinct visual identity without a second API call.
 */
const buildHomeSpriteUrl = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;

const neutralGradient = (theme: Theme): [string, string] => [
  theme.colors.background.canvas,
  theme.colors.border.default,
];

export const PokemonDetailScreen = ({ repository, summary, onBack }: PokemonDetailScreenProps) => {
  const theme = useTheme();
  const { state, retry } = usePokemonDetailViewModel(repository, summary.id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');

  const pokemon: Pokemon | null = state.status === 'success' ? state.pokemon : null;
  const primaryType = pokemon?.types[0];
  const gradient: [string, string] = primaryType
    ? [theme.pokemonType[primaryType].light, theme.pokemonType[primaryType].dark]
    : neutralGradient(theme);

  // Sprite entrance: brief delay so the screen transition finishes first,
  // then parallel opacity fade-in + spring scale with a subtle bounce.
  // Reset both values whenever the pokemon id changes so the animation
  // replays for each new detail navigation.
  const spriteScale = useRef(new Animated.Value(0.4)).current;
  const spriteOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    spriteScale.setValue(0.4);
    spriteOpacity.setValue(0);
    Animated.sequence([
      Animated.delay(theme.motion.duration.slow),
      Animated.parallel([
        Animated.spring(spriteScale, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(spriteOpacity, {
          toValue: 1,
          duration: theme.motion.duration.slow,
          easing: theme.motion.easing.decelerate,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [spriteScale, spriteOpacity, theme, summary.id]);

  // Halo breathing: continuous pulse of scale + opacity to convey "energy"
  // behind the sprite. Native driver so it does not compete with the JS
  // thread while data loads.
  const haloPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 1400,
          easing: theme.motion.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0,
          duration: 1400,
          easing: theme.motion.easing.standard,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [haloPulse, theme]);
  const haloScale = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const haloOpacity = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] });

  // Sheet content entrance: fade in with a subtle upward slide once the
  // detail resolves. Small delay lets the sprite entrance land first so
  // the eye moves top → bottom naturally instead of everything popping at
  // once. Reset on new id so the animation replays per pokemon.
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = contentOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  useEffect(() => {
    if (state.status !== 'success') {
      contentOpacity.setValue(0);
      return;
    }
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: theme.motion.duration.slow,
      delay: theme.motion.duration.base,
      easing: theme.motion.easing.decelerate,
      useNativeDriver: true,
    }).start();
  }, [state.status, contentOpacity, theme]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.hero}>
        <IconButton
          icon="‹"
          accessibilityLabel="Back"
          variant="ghost"
          onPress={onBack}
          iconColor={theme.colors.text.onAccent}
          style={styles.backTranslucent}
        />
        <View style={styles.headerBlock}>
          <ThemedText variant="bodyStrong" color="secondary" style={styles.numberText}>
            {formatNumber(summary.id)}
          </ThemedText>
          <ThemedText variant="display" style={styles.nameText}>{capitalize(summary.name)}</ThemedText>
          {pokemon !== null && (
            <View style={styles.chipRow}>
              {pokemon.types.map((type) => (
                <TypeChip key={type} type={type} />
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>

      <View style={[styles.sheet, { backgroundColor: theme.colors.background.surface }]}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
            />
          ))}
        </View>
        <View style={[styles.tabDivider, { backgroundColor: theme.colors.border.subtle }]} />

        <ScrollView
          style={styles.tabScroll}
          contentContainerStyle={styles.tabContent}
          showsVerticalScrollIndicator={false}
        >
          {state.status === 'loading' || state.status === 'idle' ? (
            <View style={styles.centered}>
              <PokeballSpinner size={56} />
            </View>
          ) : state.status === 'error' ? (
            <View style={styles.centered}>
              <ThemedText variant="heading">Failed to load</ThemedText>
              <ThemedText variant="body" color="secondary" style={styles.errorHint}>
                Check your connection and try again.
              </ThemedText>
              <ThemedText
                variant="bodyStrong"
                onPress={retry}
                style={{ color: theme.colors.accent.default, marginTop: theme.spacing.md }}
              >
                Try again
              </ThemedText>
            </View>
          ) : (
            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslate }],
              }}
            >
              {activeTab === 'about' && <AboutSection pokemon={state.pokemon} />}
              {activeTab === 'stats' && <StatsSection pokemon={state.pokemon} />}
              {(activeTab === 'evolution' || activeTab === 'moves') && (
                <ThemedText variant="body" color="secondary">
                  Coming soon.
                </ThemedText>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* Sprite floats fully inside the hero area, above the sheet.
          Concentric halos fake a radial gradient (RN core has no radial
          gradient primitive) and pulse continuously for an energy effect.
          Rendered last so it stays on top. */}
      <View style={styles.spriteContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.haloWrapper,
            { transform: [{ scale: haloScale }], opacity: haloOpacity },
          ]}
        >
          <View style={styles.haloOuter} />
          <View style={styles.haloMid} />
          <View style={styles.haloInner} />
        </Animated.View>
        <Animated.Image
          source={{ uri: buildHomeSpriteUrl(summary.id) }}
          style={[
            styles.sprite,
            { opacity: spriteOpacity, transform: [{ scale: spriteScale }] },
          ]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
};

const BaseInfoCard = ({ pokemon }: { readonly pokemon: Pokemon }) => {
  const theme = useTheme();
  return (
    <View style={[styles.infoCard, { backgroundColor: theme.colors.background.canvas }]}>
      <InfoColumn label="Height" value={`${pokemon.height.toFixed(1)} m`} />
      <InfoColumn label="Weight" value={`${pokemon.weight.toFixed(1)} kg`} />
    </View>
  );
};

const AbilitiesCard = ({ pokemon }: { readonly pokemon: Pokemon }) => {
  const theme = useTheme();
  return (
    <View style={[styles.abilitiesCard, { backgroundColor: theme.colors.background.canvas }]}>
      <ThemedText variant="overline" color="tertiary">ABILITIES</ThemedText>
      {pokemon.abilities.length === 0 ? (
        <ThemedText variant="bodyStrong">—</ThemedText>
      ) : (
        pokemon.abilities.map((ability) => (
          <ThemedText key={ability} variant="bodyStrong" style={styles.abilityItem}>
            · {capitalize(ability.replace(/-/g, ' '))}
          </ThemedText>
        ))
      )}
    </View>
  );
};

const InfoColumn = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <View style={styles.infoColumn}>
    <ThemedText variant="overline" color="tertiary">{label}</ThemedText>
    <ThemedText variant="bodyStrong">{value}</ThemedText>
  </View>
);

const AboutSection = ({ pokemon }: { readonly pokemon: Pokemon }) => (
  <View style={styles.section}>
    {pokemon.description !== undefined && pokemon.description.length > 0 && (
      <ThemedText variant="body" color="secondary">
        {pokemon.description}
      </ThemedText>
    )}
    <BaseInfoCard pokemon={pokemon} />
    <AbilitiesCard pokemon={pokemon} />
  </View>
);

const StatsSection = ({ pokemon }: { readonly pokemon: Pokemon }) => {
  const theme = useTheme();
  const primaryType = pokemon.types[0] ?? 'normal';
  const fillColor = theme.pokemonType[primaryType].primary;
  return (
    <View style={styles.section}>
      <View style={styles.statsList}>
        {STAT_ORDER.map(({ key, label }) => (
          <StatBar key={key} label={label} value={pokemon.stats[key]} color={fillColor} />
        ))}
      </View>
      <View style={[styles.totalPill, { backgroundColor: theme.colors.background.canvas }]}>
        <ThemedText variant="caption" color="tertiary">Total</ThemedText>
        <ThemedText variant="bodyStrong" style={{ color: theme.colors.accent.default }}>
          {statsTotal(pokemon.stats)}
        </ThemedText>
      </View>
    </View>
  );
};

const SPRITE_SIZE = 280;
const HALO_OUTER = 400;
const HALO_MID = 310;
const HALO_INNER = 220;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 16,
  },
  backTranslucent: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 0,
  },
  headerBlock: {
    marginTop: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  numberText: {
    fontSize: 18,
    lineHeight: 24,
  },
  nameText: {
    fontSize: 48,
    lineHeight: 54,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  spriteContainer: {
    position: 'absolute',
    top: '19%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: SPRITE_SIZE,
  },
  haloWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: HALO_OUTER,
    height: HALO_OUTER,
  },
  haloOuter: {
    position: 'absolute',
    width: HALO_OUTER,
    height: HALO_OUTER,
    borderRadius: HALO_OUTER / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  haloMid: {
    position: 'absolute',
    width: HALO_MID,
    height: HALO_MID,
    borderRadius: HALO_MID / 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  haloInner: {
    position: 'absolute',
    width: HALO_INNER,
    height: HALO_INNER,
    borderRadius: HALO_INNER / 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  sprite: {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabDivider: {
    height: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  errorHint: {
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  statsList: {
    gap: 8,
  },
  totalPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8,
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  abilitiesCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  abilityItem: {
    marginTop: 2,
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
});
