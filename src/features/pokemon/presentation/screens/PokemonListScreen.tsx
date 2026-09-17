import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../../core/ui/ThemedText';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { PokemonCard } from '../components/PokemonCard';
import { usePokemonListViewModel } from '../viewmodels/usePokemonListViewModel';

interface PokemonListScreenProps {
  readonly repository: PokemonRepository;
  readonly onSelectPokemon: (id: number) => void;
}

/**
 * Root screen for the Pokédex list. Renders a 2-column grid of
 * {@link PokemonCard}s with infinite scroll and pull-to-refresh. State,
 * pagination, and cache-aware fetching are delegated to
 * {@link usePokemonListViewModel}; this component is a thin renderer that
 * maps the state machine to UI.
 */
export const PokemonListScreen = ({ repository, onSelectPokemon }: PokemonListScreenProps) => {
  const theme = useTheme();
  const { state, loadMore, refresh, retry } = usePokemonListViewModel(repository);

  const renderItem: ListRenderItem<Pokemon> = ({ item }) => (
    <PokemonCard pokemon={item} onPress={onSelectPokemon} />
  );

  const header = (
    <View style={styles.header}>
      <ThemedText variant="display">Pokedex</ThemedText>
      <ThemedText variant="body" color="secondary">
        Discover every Pokémon
      </ThemedText>
    </View>
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background.canvas }]}>
        {header}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent.default} />
        </View>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background.canvas }]}>
        {header}
        <View style={styles.centered}>
          <ThemedText variant="heading">Something went wrong</ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.errorHint}>
            Check your connection and try again.
          </ThemedText>
          <ThemedText
            variant="bodyStrong"
            style={{ color: theme.colors.accent.default, marginTop: theme.spacing.md }}
            onPress={retry}
          >
            Try again
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background.canvas }]}>
      <FlatList
        data={state.items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={state.revalidating}
            onRefresh={refresh}
            tintColor={theme.colors.accent.default}
          />
        }
        ListFooterComponent={
          state.loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.colors.accent.default} />
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 4,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorHint: {
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
