# Pokedex Challenge

A React Native Pokédex built as a technical test. Focused on architectural
clarity and offline-first behavior.

Renders a paginated grid of Pokémon and a detail screen with stats,
description, and type info. Data comes from the public [PokéAPI](https://pokeapi.co).



https://github.com/user-attachments/assets/848dca4c-82a1-4c24-a5d1-f892f050c461



---

## 1. Quick Start

### Prerequisites

- **Node** ≥ 22.
- **Yarn** or **npm**.
- **iOS:** Xcode 15+, CocoaPods (`brew install cocoapods`).
- **Android:** Android Studio + a configured device/emulator.

### Install

```bash
npm install
```

Then, for iOS only:

```bash
cd ios && pod install && cd ..
```

Pod install links the three native modules used (`AsyncStorage`,
`LinearGradient`, `SafeAreaContext`).

### Run

```bash
# Start Metro (in one terminal)
npm start

# In another terminal, launch a platform:
npm run ios       # iOS Simulator
npm run android   # Android emulator or connected device
```

### Verify

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # jest (no test suite shipped — see Trade-offs)
```

---

## 2. Architecture

### Overview

Clean Architecture with three layers per feature, plus a cross-cutting
`core/` module and a single composition root.

```
┌────────────────────────────────────────────────┐
│  App.tsx  (composition root, providers, nav)   │
└────────────────────────────────────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
  core/theme       core/navigation    core/ui
     │                 │                 │
     └──────── used by all features ─────┘

┌────────────────────────────────────────────────┐
│  features/pokemon/                             │
│    ├── presentation  (screens, components,     │
│    │                  viewmodels, state)       │
│    ├── domain        (entities, repository     │
│    │                  interface)               │
│    └── data          (dtos, records, mappers,  │
│                       datasources, impls)      │
└────────────────────────────────────────────────┘
                       │
                       ▼
                  core/network
                  core/cache
                  core/storage
                  core/logging
                  core/result / errors
```

**Dependency direction:** `presentation → domain ← data`. Presentation and
data both depend on the domain contract; neither knows about the other.
The composition root wires them.

### Layered responsibilities

| Layer          | Responsibility                                              | Depends on             |
|----------------|-------------------------------------------------------------|------------------------|
| `domain/`      | Entities, value objects, repository **interfaces**          | Nothing (pure)         |
| `data/`        | DTOs (API shape), records (persistence shape), mappers, datasources, repository **implementations** | `domain`, `core`       |
| `presentation/`| Screens, components, hooks (viewmodels), UI state machines  | `domain`, `core/ui`, `core/theme` |
| `core/*`       | Framework-agnostic primitives (Result, cache, HTTP, theme, navigation) | Nothing / peer core    |

### Composition root

`src/app/composition.ts` is the single file where abstractions are bound
to concrete implementations. Consumers import the exported instances
typed as their interface — the concrete class name never leaks.

```ts
// composition.ts (excerpt)
const logger      = new ConsoleLogger(__DEV__ ? LogLevel.Debug : LogLevel.Warn);
const httpClient  = new FetchHttpClient(POKEAPI_BASE_URL, HTTP_TIMEOUT_MS, logger);
const kvStore     = new AsyncStorageKeyValueStore();
const jsonCache   = new JsonCache(kvStore, CACHE_SCHEMA_VERSION, logger);

const remoteDs    = new PokeApiRemoteDataSource(httpClient, logger);
const localDs     = new CachedPokemonLocalDataSource(jsonCache);

export const pokemonRepository: PokemonRepository =
  new PokemonRepositoryImpl(localDs, remoteDs, logger);
```

Swapping `AsyncStorageKeyValueStore` for `InMemoryKeyValueStore` in tests,
or `FetchHttpClient` for a mock, is a one-line change. Nothing else moves.

---

## 3. Technical Decisions

### 3.1 Offline-first strategy

The app is designed to survive intermittent connectivity.

- **`JsonCache`** wraps `KeyValueStore` (backed by AsyncStorage) with a
  schema version, TTL, and pluggable validation. Corrupted or
  version-mismatched entries are evicted transparently.
- **Repository is cache-first with stale fallback:**
  1. Read from local cache. If fresh → return.
  2. Otherwise fetch from remote.
  3. If remote fails **and** stale cache exists → serve stale + log warning.
  4. If remote fails and no cache → return `err`.
- Fetch failures never crash the app; they surface as `AppError` via `Result`.

### 3.2 Result-based error handling

No throwing in the domain or data layers. Every fallible operation returns
`Result<T, AppError>` (discriminated union on `ok`), forcing the caller to
handle both branches at compile time:

```ts
const r = await repository.getById(25);
if (r.ok) render(r.value);
else showError(r.error);
```

`AppError` is a domain concept: `{ code: AppErrorCode; message; cause? }`.
Codes classify failures (`Network`, `Timeout`, `NotFound`, `Server`,
`InvalidResponse`, …); message carries diagnostic context (URL, status);
`cause` preserves the original error for observability.

### 3.3 Domain-driven repository

- `PokemonRepository` interface lives in `domain/`.
- Concrete `PokemonRepositoryImpl` lives in `data/`.
- Consumers depend on the **interface** — DIP end-to-end.

Two operations:
- `getPageSummaries(offset, limit)` — light payload for the grid (id + name + spriteUrl).
- `getById(id)` — full detail, fetched only when the user opens a specific pokémon.

### 3.4 Fetch strategy: summaries + on-demand detail

**Problem observed:** naïvely fetching each pokemon's full detail to render
the list produces 21 requests per page (one listing + 20 details). Wasteful
if the user only opens a few.

**Solution:** the list endpoint returns `{ name, url }` — enough to derive
the id (from the URL) and the sprite URL (deterministic path on the
[PokéAPI sprites CDN](https://github.com/PokeAPI/sprites)). Cards render
from this alone. Full detail is fetched only when the user taps a card.

Result: **1 API call per page** (down from 21). Details are cached, so
subsequent visits are instant.

### 3.5 Discriminated union state machines

`PokemonListState` and `PokemonDetailState` are modeled as unions:

```ts
type PokemonListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'success'; items; nextOffset; hasMore; loadingMore; revalidating };
```

TypeScript **prevents impossible combinations** at compile time
(e.g. `error + items`). The reducer is a pure `(state, action) → state`
function, testable in isolation from React.

Both list and detail viewmodels are hooks (`usePokemonListViewModel`,
`usePokemonDetailViewModel`) that expose `{ state, actions }`. Screens
are thin renderers that map state to UI.

### 3.6 Custom navigation abstraction

We do **not** use React Navigation. Instead we ship a tiny router:

```
core/navigation/
  Route.ts          discriminated union of routes
  Router.ts         interface (contract)
  StackRouter.ts    useReducer + stack impl
  RouterProvider.tsx Context provider
  useRouter.ts      hook
  RouterOutlet.tsx  exhaustive route matcher + keep-alive render
```

**Deliberately over-engineered for a 2-screen app.** The goal was to
demonstrate DIP, discriminated unions, exhaustive typing, and the
keep-alive pattern that preserves screen state across navigation — exactly
what React Navigation offers, in ~150 lines of app-owned code.

Key properties:
- `Route` is a discriminated union → `router.navigate({name:'pokemonDetail', summary})`
  is type-safe; missing payload fields are compile errors.
- `RouterOutlet` uses a `RouteRenderers` mapped type → adding a new route
  forces the developer to add its renderer (compile error otherwise).
- **Keep-alive:** the outlet renders the entire stack; the top is visible
  and interactive, the rest stay mounted but hidden (`opacity: 0` +
  `pointerEvents: 'none'`). Popping restores full state, scroll included.
- New screens fade in via `Animated.View` (motion tokens).

**In production I would not build this** — I would use React Navigation.
It is here as an architectural showcase.

### 3.7 Card gradient — derived, not extracted

The Figma design has type-colored duotone gradients per card. In a
libraries-allowed world, we would extract the two dominant colors from
the sprite PNG (via `react-native-image-colors`) and cache them.

Extracting pixel data is not possible with RN core alone. We opted to
stay strict and **derive a deterministic gradient from the pokémon id**
using the golden angle (137.508°):

```ts
hue   = (id * 137.508) mod 360      // unique per id, evenly distributed
light = HSL(hue, 42%, 93%)          // very pale
dark  = HSL(hue, 55%, 62%)          // medium tone
```

Trade-off: colors do not match the pokémon's canonical palette (Pikachu is
not yellow). But neighbours in the grid never repeat a hue, cards feel
alive, and it costs zero fetches, zero libs.

### 3.8 Progressive enhancement on detail

Tapping a card navigates to detail with the `PokemonSummary` as the route
payload. The hero (sprite + name + number) renders **immediately** from
the summary. The sheet content (chips, stats, description) fades in
after the detail fetch resolves — with a small delay so the sprite
entrance lands first.

`/pokemon/{id}` and `/pokemon-species/{id}` are fetched **in parallel** —
species is best-effort (its failure omits the description but never blocks
the pokémon from rendering).

### 3.9 Design tokens

`src/core/theme/` is the source of truth for visual language:

- `tokens/colors.ts` — primitive palette + 18 pokémon type triads
- `tokens/typography.ts` — DM Sans scale (Display → Overline)
- `tokens/spacing.ts` — 4pt grid
- `tokens/radii.ts` — sm → full
- `tokens/motion.ts` — durations + easings (`Easing.bezier`)
- `Theme.ts` — semantic layer, `lightTheme` + `darkTheme` alias into primitives
- `ThemeProvider.tsx` + `useTheme.ts` — Context + hook, follows
  `useColorScheme()` automatically

Components consume the theme through `useTheme()`; no component imports
a specific theme instance.

The design system mirrors 1:1 the Figma file at
[figma.com/design/GJePFEoGaFpzOP1Ppyry42](https://www.figma.com/design/GJePFEoGaFpzOP1Ppyry42/Pokemon).

---

## 4. Library Policy

**Rule:** no external libraries beyond what React Native itself provides —
softened to allow packages published by the React Native org or considered
de-facto baseline. The intent is to demonstrate architectural thinking with
primitives, not to reject every npm dependency.

**Allowed** (and why):

| Package                                | Why                                                     |
|----------------------------------------|---------------------------------------------------------|
| `@react-native-async-storage/async-storage` | Persistence: RN core exposes no storage API. Community-standard. |
| `react-native-linear-gradient`         | RN core has no gradient primitive. Gradient is central to the design. |
| `react-native-safe-area-context`       | RN core `SafeAreaView` is deprecated since 0.71. Standard replacement. |

**Rejected** (with reason):

- **`react-native-image-colors`** — would enable extracting dominant colors
  from sprite PNGs. Traded for the golden-angle derivation (§3.7).
- **`react-native-svg`** — would enable radial gradients (for the halo).
  Traded for three concentric semi-transparent circles (approximation).
- **React Navigation** — replaced with the custom router (§3.6) as an
  architectural showcase.
- **State libraries** (Redux, Zustand, Jotai) — `useReducer` + custom
  hooks cover our needs and remain framework-native.
- **HTTP libraries** (Axios) — `fetch` + `AbortController` are enough.
- **Form / validation libraries** (Formik, Zod) — no forms in scope; DTO
  validation done with hand-written type guards.

---

## 5. Trade-offs & Follow-ups

Honest limitations of the current state:

- **No test suite shipped.** The architecture supports testing:
  reducers are pure, viewmodels accept `PokemonRepository` (interface,
  easy to fake), `InMemoryKeyValueStore` is available as a persistence
  double. The Jest infrastructure is configured. Not shipped for scope.
- **Halo is not a real radial gradient.** Three concentric semi-transparent
  circles approximate the effect; the correct implementation needs
  `react-native-svg`.
- **Cards do not display type chips.** Consequence of §3.4 — we do not
  fetch per-pokemon details in the list. Types show only in the detail.
- **Navigation is minimal.** No gesture-driven back, no deep linking, no
  URL synchronization. Would use React Navigation in production.
- **No offline sprite caching.** Sprites are served by the platform's
  native image cache (`NSURLCache` / Fresco), which can be purged. Real
  offline images would require `react-native-fs` or bundling.
- **Only About and Stats tabs are implemented.** Evolution and Moves
  render a placeholder.
- **Description is fetched only for the current pokémon.** Not pre-warmed
  in the list; a slower detail open on first tap.

---

## 6. File Structure

```
App.tsx                               root component
src/
├── app/
│   └── composition.ts                composition root (DI)
├── core/
│   ├── cache/
│   │   └── JsonCache.ts              versioned + TTL + logged
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── AppErrorCode.ts
│   ├── logging/
│   │   ├── Logger.ts                 abstract + noop + BaseLogger
│   │   └── ConsoleLogger.ts
│   ├── navigation/
│   │   ├── Route.ts                  discriminated union
│   │   ├── Router.ts                 interface
│   │   ├── StackRouter.ts            useReducer impl
│   │   ├── RouterProvider.tsx        Context
│   │   ├── useRouter.ts              hook
│   │   └── RouterOutlet.tsx          exhaustive + keep-alive
│   ├── network/
│   │   ├── HttpClient.ts             interface
│   │   └── FetchHttpClient.ts        fetch + AbortController + timeout
│   ├── result/
│   │   └── Result.ts                 Result<T,E> + ok/err helpers
│   ├── storage/
│   │   ├── KeyValueStore.ts          interface
│   │   ├── AsyncStorageKeyValueStore.ts
│   │   └── InMemoryKeyValueStore.ts  (test double)
│   ├── theme/
│   │   ├── tokens/{colors,typography,spacing,radii,motion}.ts
│   │   ├── Theme.ts
│   │   ├── lightTheme.ts / darkTheme.ts
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   └── ui/
│       ├── ThemedText.tsx            theme-aware Text
│       ├── IconButton.tsx            Pressable + variants
│       └── PokeballSpinner.tsx       animated loading indicator
└── features/
    └── pokemon/
        ├── domain/
        │   ├── entities/{Pokemon,PokemonSummary,PokemonSummariesPage}.ts
        │   ├── enums/PokemonType.ts
        │   └── repositories/PokemonRepository.ts
        ├── data/
        │   ├── dtos/{PokemonDetailDto,PokemonSpeciesDto,ResourceLinkDto}.ts
        │   ├── records/{StoredPokemon,StoredSummary,StoredSummariesPage}.ts
        │   ├── mappers/{dtoToDomain,recordToDomain,domainToRecord,
        │   │             summaryMappers,speciesMapper}.ts
        │   ├── types/{PagingKey,RemotePage}.ts
        │   ├── datasources/
        │   │   ├── PokemonRemoteDataSource.ts + PokeApiRemoteDataSource.ts
        │   │   └── PokemonLocalDataSource.ts + CachedPokemonLocalDataSource.ts
        │   └── repositories/PokemonRepositoryImpl.ts
        └── presentation/
            ├── components/{PokemonCard,TypeChip,StatBar,Tab}.tsx
            ├── state/{PokemonListState,PokemonDetailState}.ts
            ├── viewmodels/{usePokemonListViewModel,usePokemonDetailViewModel}.ts
            ├── screens/{PokemonListScreen,PokemonDetailScreen}.tsx
            └── utils/deriveGradient.ts
```
