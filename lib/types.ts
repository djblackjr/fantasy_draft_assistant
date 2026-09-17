// Shared domain types used across the app.

export type Position = "QB" | "RB" | "WR" | "TE" | "FLEX" | "DST" | "K";

/** ESPN's own injury designation for a player this week. ACTIVE means no
 * designation — cleared to play as far as the injury report is concerned. */
export type InjuryStatus =
  | "ACTIVE"
  | "QUESTIONABLE"
  | "DOUBTFUL"
  | "OUT"
  | "INJURY_RESERVE"
  | "SUSPENSION";

/** A player as known to ESPN (or demo fixtures shaped the same way). */
export interface EspnPlayer {
  espnId: number;
  name: string;
  position: Position;
  proTeam: string;
  byeWeek: number | null;
  /** true once ESPN's draft detail reports this player picked */
  drafted: boolean;
  injuryStatus: InjuryStatus | null;
}

/** One completed pick in the live draft. */
export interface DraftPick {
  overallPick: number;
  round: number;
  roundPick: number;
  teamId: number;
  espnPlayerId: number;
}

export interface EspnTeam {
  teamId: number;
  name: string;
  draftSlot: number | null;
}

export interface LeagueSettings {
  leagueId: string;
  season: number;
  name: string;
  teamCount: number;
  myTeamId: number | null;
  teams: EspnTeam[];
  /** roster slot counts, e.g. { QB: 1, RB: 2, WR: 2, FLEX: 1, TE: 1, DST: 1, K: 1, BE: 6 } */
  rosterSlots: Record<string, number>;
  /** draft order / rounds, if the draft has been scheduled */
  draftRounds: number;
  isSnakeDraft: boolean;
}

/** A row in the user's rankings cheat sheet, merged with ESPN identity where matched. */
export interface CheatSheetPlayer {
  /** stable local id (used before/without an ESPN match) */
  id: string;
  name: string;
  position: Position;
  team: string;
  /** rank as imported (1 = best) */
  rank: number;
  tier: number;
  byeWeek: number | null;
  notes: string;
  /** matched ESPN player id, once resolved */
  espnId: number | null;
  drafted: boolean;
  draftedByTeamId: number | null;
}

export interface RosterPlayer {
  espnId: number;
  name: string;
  position: Position;
  proTeam: string;
  byeWeek: number | null;
  slot: string;
  injuryStatus: InjuryStatus | null;
}
