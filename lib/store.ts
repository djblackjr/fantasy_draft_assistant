"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CheatSheetPlayer,
  DraftPick,
  EspnPlayer,
  LeagueSettings,
} from "./types";
import { parseRankingsCsv } from "./rankings";
import { matchToEspn } from "./match";

interface DraftState {
  leagueSettings: LeagueSettings | null;
  espnPlayers: EspnPlayer[];
  draftPicks: DraftPick[];
  cheatSheet: CheatSheetPlayer[];
  lastImportWarnings: string[];

  setLeagueSettings: (s: LeagueSettings) => void;
  setEspnPlayers: (players: EspnPlayer[]) => void;
  setDraftPicks: (picks: DraftPick[]) => void;

  importCheatSheetCsv: (csvText: string) => void;
  updateCheatSheetRow: (id: string, patch: Partial<CheatSheetPlayer>) => void;
  clearCheatSheet: () => void;
  rematchEspnIds: () => void;
}

/** Recomputes drafted / draftedByTeamId on every cheat-sheet row from the
 * current draft picks + espn player list. */
function applyDraftStatus(
  cheatSheet: CheatSheetPlayer[],
  picks: DraftPick[]
): CheatSheetPlayer[] {
  const pickByPlayerId = new Map(picks.map((p) => [p.espnPlayerId, p]));
  return cheatSheet.map((row) => {
    if (!row.espnId) return { ...row, drafted: false, draftedByTeamId: null };
    const pick = pickByPlayerId.get(row.espnId);
    return {
      ...row,
      drafted: !!pick,
      draftedByTeamId: pick ? pick.teamId : null,
    };
  });
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      leagueSettings: null,
      espnPlayers: [],
      draftPicks: [],
      cheatSheet: [],
      lastImportWarnings: [],

      setLeagueSettings: (s) => set({ leagueSettings: s }),

      setEspnPlayers: (players) => {
        set({ espnPlayers: players });
        get().rematchEspnIds();
      },

      setDraftPicks: (picks) =>
        set((state) => ({
          draftPicks: picks,
          cheatSheet: applyDraftStatus(state.cheatSheet, picks),
        })),

      importCheatSheetCsv: (csvText) => {
        const { players, warnings } = parseRankingsCsv(csvText);
        const { matched } = matchToEspn(players, get().espnPlayers);
        const withDraftStatus = applyDraftStatus(matched, get().draftPicks);
        set({ cheatSheet: withDraftStatus, lastImportWarnings: warnings });
      },

      updateCheatSheetRow: (id, patch) =>
        set((state) => ({
          cheatSheet: state.cheatSheet.map((row) =>
            row.id === id ? { ...row, ...patch } : row
          ),
        })),

      clearCheatSheet: () => set({ cheatSheet: [], lastImportWarnings: [] }),

      rematchEspnIds: () => {
        const { matched } = matchToEspn(get().cheatSheet, get().espnPlayers);
        set({ cheatSheet: applyDraftStatus(matched, get().draftPicks) });
      },
    }),
    {
      name: "fantasy-draft-assistant",
      // only the cheat sheet is worth persisting across sessions; league
      // data / picks are re-fetched live each time.
      partialize: (state) => ({ cheatSheet: state.cheatSheet }),
    }
  )
);
