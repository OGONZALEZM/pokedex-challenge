import type { Result } from '../../../../core/result/Result';
import type { AppError } from '../../../../core/errors/AppError';
import type { PokemonDetailDto } from '../dtos/PokemonDetailDto';
import type { ResourceLinkDto } from '../dtos/ResourceLinkDto';
import type { RemotePage } from '../types/RemotePage';
import type { PagingKey } from '../types/PagingKey';

/**
 * Contract for retrieving Pokémon data from the PokéAPI network boundary.
 *
 * Returns raw DTOs (not domain entities): the datasource is responsible for
 * transport and structural validation only; translation to the domain model
 * is the {@link PokemonRepository} implementation's concern. Every operation
 * resolves to a {@link Result}; no method throws.
 */
export interface PokemonRemoteDataSource {
  /**
   * Retrieves a page of Pokémon references (name + URL) from the paginated
   * listing endpoint.
   */
  fetchPage(paging: PagingKey): Promise<Result<RemotePage<ResourceLinkDto>, AppError>>;

  /**
   * Retrieves the full detail of a single Pokémon by its numeric id.
   */
  fetchDetail(id: number): Promise<Result<PokemonDetailDto, AppError>>;
}
