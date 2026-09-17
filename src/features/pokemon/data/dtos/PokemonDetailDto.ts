import { isResourceLinkDto, type ResourceLinkDto } from './ResourceLinkDto';

/**
 * Raw response of `GET /pokemon/{id}`. Only the fields consumed by the app
 * are modeled; PokéAPI returns many additional properties that are ignored
 * intentionally to keep the surface minimal.
 */
export interface PokemonDetailDto {
  readonly id: number;
  readonly name: string;
  readonly height: number;
  readonly weight: number;
  readonly sprites: PokemonDetailSpritesDto;
  readonly types: readonly PokemonDetailTypeSlotDto[];
  readonly stats: readonly PokemonDetailStatSlotDto[];
  readonly abilities: readonly PokemonDetailAbilitySlotDto[];
}

export interface PokemonDetailSpritesDto {
  readonly front_default: string | null;
  readonly other?: {
    readonly 'official-artwork'?: {
      readonly front_default: string | null;
    };
  };
}

export interface PokemonDetailTypeSlotDto {
  readonly slot: number;
  readonly type: ResourceLinkDto;
}

export interface PokemonDetailStatSlotDto {
  readonly base_stat: number;
  readonly effort: number;
  readonly stat: ResourceLinkDto;
}

export interface PokemonDetailAbilitySlotDto {
  readonly ability: ResourceLinkDto;
  readonly is_hidden: boolean;
  readonly slot: number;
}

const isSprites = (value: unknown): value is PokemonDetailSpritesDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.front_default !== null && typeof v.front_default !== 'string') return false;
  if (v.other === undefined) return true;
  if (typeof v.other !== 'object' || v.other === null) return false;
  const artwork = (v.other as Record<string, unknown>)['official-artwork'];
  if (artwork === undefined) return true;
  if (typeof artwork !== 'object' || artwork === null) return false;
  const fd = (artwork as Record<string, unknown>).front_default;
  return fd === null || typeof fd === 'string';
};

const isTypeSlot = (value: unknown): value is PokemonDetailTypeSlotDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.slot === 'number' && isResourceLinkDto(v.type);
};

const isStatSlot = (value: unknown): value is PokemonDetailStatSlotDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.base_stat === 'number'
    && typeof v.effort === 'number'
    && isResourceLinkDto(v.stat);
};

const isAbilitySlot = (value: unknown): value is PokemonDetailAbilitySlotDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return isResourceLinkDto(v.ability)
    && typeof v.is_hidden === 'boolean'
    && typeof v.slot === 'number';
};

export const isPokemonDetailDto = (value: unknown): value is PokemonDetailDto => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'number'
    && typeof v.name === 'string'
    && typeof v.height === 'number'
    && typeof v.weight === 'number'
    && isSprites(v.sprites)
    && Array.isArray(v.types) && v.types.every(isTypeSlot)
    && Array.isArray(v.stats) && v.stats.every(isStatSlot)
    && Array.isArray(v.abilities) && v.abilities.every(isAbilitySlot);
};
