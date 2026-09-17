import type { PokemonSummary } from '../../domain/entities/PokemonSummary';
import type { PokemonSummariesPage } from '../../domain/entities/PokemonSummariesPage';
import type { StoredSummary } from '../records/StoredSummary';
import type { StoredSummariesPage } from '../records/StoredSummariesPage';

export const mapStoredSummaryToDomain = (record: StoredSummary): PokemonSummary => ({
  id: record.id,
  name: record.name,
  spriteUrl: record.spriteUrl,
});

export const mapSummaryToStored = (summary: PokemonSummary): StoredSummary => ({
  id: summary.id,
  name: summary.name,
  spriteUrl: summary.spriteUrl,
});

export const mapStoredSummariesPageToDomain = (record: StoredSummariesPage): PokemonSummariesPage => ({
  items: record.items.map(mapStoredSummaryToDomain),
  hasMore: record.nextOffset !== null,
  nextOffset: record.nextOffset,
});

export const mapSummariesPageToStored = (page: PokemonSummariesPage): StoredSummariesPage => ({
  items: page.items.map(mapSummaryToStored),
  nextOffset: page.nextOffset,
});
