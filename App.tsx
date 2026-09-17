import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/core/theme/ThemeProvider';
import { RouterProvider } from './src/core/navigation/RouterProvider';
import { RouterOutlet } from './src/core/navigation/RouterOutlet';
import { useRouter } from './src/core/navigation/useRouter';
import { pokemonRepository } from './src/app/composition';
import { PokemonListScreen } from './src/features/pokemon/presentation/screens/PokemonListScreen';
import { PokemonDetailScreen } from './src/features/pokemon/presentation/screens/PokemonDetailScreen';

/**
 * Screen dispatcher. Reads the current route from the router and maps it
 * to the appropriate screen. Kept separate from {@link App} so it can call
 * {@link useRouter} — the hook requires a {@link RouterProvider} ancestor.
 *
 * Adding a new route variant will produce a compile error here until its
 * renderer is added, per the exhaustive {@link RouteRenderers} type.
 */
const AppNavigator = () => {
  const router = useRouter();
  return (
    <RouterOutlet
      routes={{
        pokemonList: () => (
          <PokemonListScreen
            repository={pokemonRepository}
            onSelectPokemon={(summary) => router.navigate({ name: 'pokemonDetail', summary })}
          />
        ),
        pokemonDetail: (route) => (
          <PokemonDetailScreen
            repository={pokemonRepository}
            summary={route.summary}
            onBack={router.goBack}
          />
        ),
      }}
    />
  );
};

/**
 * App root. Layers the required providers in outer-to-inner order:
 *
 *   SafeAreaProvider → ThemeProvider → RouterProvider → screens
 *
 * The composition root ({@link pokemonRepository} in `src/app/composition.ts`)
 * wires the concrete infrastructure (HTTP, cache, logger) once and is
 * imported here as the single value the navigator hands down to screens.
 */
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RouterProvider initial={{ name: 'pokemonList' }}>
          <AppNavigator />
        </RouterProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
