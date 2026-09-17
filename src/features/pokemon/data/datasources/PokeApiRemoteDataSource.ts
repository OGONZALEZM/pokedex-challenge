import type { HttpClient } from '../../../../core/network/HttpClient';
import { noopLogger, type Logger } from '../../../../core/logging/Logger';
import { ok, err, type Result } from '../../../../core/result/Result';
import { appError, type AppError } from '../../../../core/errors/AppError';
import { AppErrorCode } from '../../../../core/errors/AppErrorCode';
import { isPokemonDetailDto, type PokemonDetailDto } from '../dtos/PokemonDetailDto';
import { isResourceLinkDto, type ResourceLinkDto } from '../dtos/ResourceLinkDto';
import { isRemotePage, type RemotePage } from '../types/RemotePage';
import type { PagingKey } from '../types/PagingKey';
import type { PokemonRemoteDataSource } from './PokemonRemoteDataSource';

const isRemotePageOfLinks = isRemotePage(isResourceLinkDto);

/**
 * {@link PokemonRemoteDataSource} implementation backed by an {@link HttpClient}.
 * Responsible for URL composition and structural validation of PokéAPI
 * responses; any schema mismatch is reported as {@link AppErrorCode.InvalidResponse}
 * and logged at `error` level since it signals a backend contract breach.
 */
export class PokeApiRemoteDataSource implements PokemonRemoteDataSource {
  constructor(
    private readonly http: HttpClient,
    private readonly logger: Logger = noopLogger,
  ) {}

  async fetchPage(paging: PagingKey): Promise<Result<RemotePage<ResourceLinkDto>, AppError>> {
    const path = `/pokemon?limit=${paging.limit}&offset=${paging.offset}`;
    const response = await this.http.getJson(path);
    if (!response.ok) return response;

    if (!isRemotePageOfLinks(response.value)) {
      this.logger.error('PokeApiRemoteDataSource: malformed pokemon list response', undefined, { path });
      return err(appError(AppErrorCode.InvalidResponse, `Malformed pokemon list response at ${path}`));
    }
    return ok(response.value);
  }

  async fetchDetail(id: number): Promise<Result<PokemonDetailDto, AppError>> {
    const path = `/pokemon/${id}`;
    const response = await this.http.getJson(path);
    if (!response.ok) return response;

    if (!isPokemonDetailDto(response.value)) {
      this.logger.error('PokeApiRemoteDataSource: malformed pokemon detail response', undefined, { path, id });
      return err(appError(AppErrorCode.InvalidResponse, `Malformed pokemon detail response for id ${id}`));
    }
    return ok(response.value);
  }
}
