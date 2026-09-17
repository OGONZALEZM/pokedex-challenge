import { ConsoleLogger } from '../core/logging/ConsoleLogger';
import { LogLevel } from '../core/logging/Logger';
import { FetchHttpClient } from '../core/network/FetchHttpClient';
import { JsonCache } from '../core/cache/JsonCache';
import { AsyncStorageKeyValueStore } from '../core/storage/AsyncStorageKeyValueStore';
import { CachedPokemonLocalDataSource } from '../features/pokemon/data/datasources/CachedPokemonLocalDataSource';
import { PokeApiRemoteDataSource } from '../features/pokemon/data/datasources/PokeApiRemoteDataSource';
import { PokemonRepositoryImpl } from '../features/pokemon/data/repositories/PokemonRepositoryImpl';
import type { PokemonRepository } from '../features/pokemon/domain/repositories/PokemonRepository';

/**
 * Composition root — the single place where abstractions are bound to their
 * concrete implementations. Consumers import the exported instances typed as
 * their contract (never as the concrete class), preserving DIP end-to-end.
 *
 * Instantiation happens at module import time; RN evaluates this on app boot
 * before the first render, so no additional bootstrap step is required.
 */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const HTTP_TIMEOUT_MS = 10_000;
const CACHE_SCHEMA_VERSION = 1;

const logger = new ConsoleLogger(__DEV__ ? LogLevel.Debug : LogLevel.Warn);
const httpClient = new FetchHttpClient(POKEAPI_BASE_URL, HTTP_TIMEOUT_MS, logger);
const keyValueStore = new AsyncStorageKeyValueStore();
const jsonCache = new JsonCache(keyValueStore, CACHE_SCHEMA_VERSION, logger);

const pokemonRemoteDataSource = new PokeApiRemoteDataSource(httpClient, logger);
const pokemonLocalDataSource = new CachedPokemonLocalDataSource(jsonCache);

export const pokemonRepository: PokemonRepository = new PokemonRepositoryImpl(
  pokemonLocalDataSource,
  pokemonRemoteDataSource,
  logger,
);
