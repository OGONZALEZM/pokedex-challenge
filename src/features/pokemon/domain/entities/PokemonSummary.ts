/**
 * Lightweight projection of a Pokémon carrying only what the grid list
 * needs. Fetched cheaply from the paginated listing endpoint — no
 * per-item detail call — and used as the "seed" payload when navigating
 * to the detail screen so the hero can render immediately while the full
 * entity loads in the background.
 */
export interface PokemonSummary {
  readonly id: number;
  readonly name: string;
  readonly spriteUrl: string;
}
