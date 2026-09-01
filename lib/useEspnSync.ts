"use client";

import { useCallback, useEffect, useState } from "react";
import { useDraftStore } from "./store";
import type { LeagueSettings } from "./types";

interface SyncState {
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  leagueSettings: LeagueSettings | null;
}

/** Fetches league settings + player universe + live draft picks from our
 * API routes and pushes them into the zustand store. Pass `poll` (ms) to
 * keep re-fetching draft picks (used by the live draft page); omit it for
 * a one-shot load. */
export function useEspnSync(pollMs?: number): SyncState & { refresh: () => void } {
  const setLeagueSettings = useDraftStore((s) => s.setLeagueSettings);
  const setEspnPlayers = useDraftStore((s) => s.setEspnPlayers);
  const setDraftPicks = useDraftStore((s) => s.setDraftPicks);

  const [state, setState] = useState<SyncState>({
    loading: true,
    error: null,
    demoMode: false,
    leagueSettings: null,
  });

  const loadAll = useCallback(async () => {
    try {
      const [leagueRes, playersRes, draftRes] = await Promise.all([
        fetch("/api/espn/league", { cache: "no-store" }),
        fetch("/api/espn/players", { cache: "no-store" }),
        fetch("/api/espn/draft", { cache: "no-store" }),
      ]);
      const [league, players, draft] = await Promise.all([
        leagueRes.json(),
        playersRes.json(),
        draftRes.json(),
      ]);
      if (!leagueRes.ok) throw new Error(league.error ?? "Failed to load league");
      if (!playersRes.ok) throw new Error(players.error ?? "Failed to load players");
      if (!draftRes.ok) throw new Error(draft.error ?? "Failed to load draft picks");

      setLeagueSettings(league.settings);
      setEspnPlayers(players.players);
      setDraftPicks(draft.picks);
      setState({
        loading: false,
        error: null,
        demoMode: league.demoMode,
        leagueSettings: league.settings,
      });
    } catch (e: any) {
      setState((prev) => ({ ...prev, loading: false, error: e.message }));
    }
  }, [setLeagueSettings, setEspnPlayers, setDraftPicks]);

  const refreshDraftOnly = useCallback(async () => {
    try {
      const res = await fetch("/api/espn/draft", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to refresh draft");
      setDraftPicks(json.picks);
    } catch {
      // Transient poll failures shouldn't blow away an already-loaded board;
      // the next interval tick will try again.
    }
  }, [setDraftPicks]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!pollMs) return;
    const id = setInterval(refreshDraftOnly, pollMs);
    return () => clearInterval(id);
  }, [pollMs, refreshDraftOnly]);

  return { ...state, refresh: loadAll };
}
