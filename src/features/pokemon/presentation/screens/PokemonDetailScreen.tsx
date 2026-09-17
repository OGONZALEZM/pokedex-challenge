import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { IconButton } from '../../../../core/ui/IconButton';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Pokemon, PokemonStats } from '../../domain/entities/Pokemon';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { TypeChip } from '../components/TypeChip';
import { StatBar } from '../components/StatBar';
import { Tab } from '../components/Tab';
import { usePokemonDetailViewModel } from '../viewmodels/usePokemonDetailViewModel';

interface PokemonDetailScreenProps {
  readonly repository: PokemonRepository;
  readonly id: number;
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

export const PokemonDetailScreen = ({ repository, id, onBack }: PokemonDetailScreenProps) => {
  const theme = useTheme();
  const { state, retry } = usePokemonDetailViewModel(repository, id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background.canvas }]}>
        <IconButton icon="‹" accessibilityLabel="Back" variant="ghost" onPress={onBack} style={styles.backAbsolute} />
        <ActivityIndicator size="large" color={theme.colors.accent.default} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background.canvas }]}>
        <IconButton icon="‹" accessibilityLabel="Back" variant="ghost" onPress={onBack} style={styles.backAbsolute} />
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
    );
  }

  const pokemon = state.pokemon;
  const primaryType = pokemon.types[0] ?? 'normal';
  const palette = theme.pokemonType[primaryType];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[palette.light, palette.dark]}
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
          <ThemedText variant="overline" color="secondary">
            {formatNumber(pokemon.id)}
          </ThemedText>
          <ThemedText variant="display">{capitalize(pokemon.name)}</ThemedText>
          <View style={styles.chipRow}>
            {pokemon.types.map((type) => (
              <TypeChip key={type} type={type} />
            ))}
          </View>
        </View>

        <View style={styles.spriteWrapper} pointerEvents="none">
          <View style={styles.halo} />
          {pokemon.spriteUrl.length > 0 && (
            <Image
              source={{ uri: pokemon.spriteUrl }}
              style={styles.sprite}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
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

        <ScrollView contentContainerStyle={styles.tabContent}>
          {activeTab === 'about' && <AboutSection pokemon={pokemon} />}
          {activeTab === 'stats' && <StatsSection pokemon={pokemon} />}
          {(activeTab === 'evolution' || activeTab === 'moves') && (
            <ThemedText variant="body" color="secondary">
              Coming soon.
            </ThemedText>
          )}
        </ScrollView>
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
      <InfoColumn label="Abilities" value={pokemon.abilities.map(capitalize).join(', ') || '—'} />
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
    <BaseInfoCard pokemon={pokemon} />
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
      <BaseInfoCard pokemon={pokemon} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backAbsolute: {
    position: 'absolute',
    top: 48,
    left: 16,
  },
  backTranslucent: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 0,
  },
  headerBlock: {
    marginTop: 48,
    paddingHorizontal: 8,
    gap: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  spriteWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -60,
  },
  halo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  sprite: {
    width: 260,
    height: 260,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '52%',
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
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
  section: {
    gap: 20,
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
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  errorHint: {
    marginTop: 8,
    textAlign: 'center',
  },
});
