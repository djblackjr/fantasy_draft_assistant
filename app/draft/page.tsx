"use client";

import { useMemo, useState } from "react";
import { useDraftStore } from "@/lib/store";
import { useEspnSync } from "@/lib/useEspnSync";
import PlayerTable from "@/components/PlayerTable";
import {
  bestAvailable,
  computeMyPickNumbers,
  nextMyPick,
  positionNeeds,
  recommendPick,
} from "@/lib/draftLogic";
import type { Position } from "@/lib/types";

const POSITIONS: (Position | "ALL")[] = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"];
const POLL_MS = 6000;

export default function DraftPage() {
  const { loading, error, leagueSettings, refresh } = useEspnSync(POLL_MS);
  const cheatSheet = useDraftStore((s) => s.cheatSheet);
  const draftPicks = useDraftStore((s) => s.draftPicks);
  const espnPlayers = useDraftStore((s) => s.espnPlayers);
  const [posFilter, setPosFilter] = useState<Position | "ALL">("ALL");

  const myTeamId = leagueSettings?.myTeamId ?? null;
  const rosterSlots = useMemo(() => leagueSettings?.rosterSlots ?? {}, [leagueSettings]);

  const playerById = useMemo(() => new Map(espnPlayers.map((p) => [p.espnId, p])), [espnPlayers]);

  const myRoster = useMemo(() => {
    if (!myTeamId) return [];
    return draftPicks
      .filter((p) => p.teamId === myTeamId)
      .map((p) => playerById.get(p.espnPlayerId))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [draftPicks, myTeamId, playerById]);

  const needs = useMemo(() => positionNeeds(rosterSlots, myRoster), [rosterSlots, myRoster]);
  const recommendation = useMemo(() => recommendPick(cheatSheet, needs), [cheatSheet, needs]);
  const available = useMemo(() => bestAvailable(cheatSheet, posFilter, 25), [cheatSheet, posFilter]);

  const recentPicks = useMemo(() => {
    return [...draftPicks]
      .sort((a, b) => b.overallPick - a.overallPick)
      .slice(0, 12)
      .map((pick) => ({
        pick,
        player: playerById.get(pick.espnPlayerId),
        team: leagueSettings?.teams.find((t) => t.teamId === pick.teamId),
      }));
  }, [draftPicks, playerById, leagueSettings]);

  const myPickNumbers = useMemo(() => {
    if (!leagueSettings?.myTeamId) return [];
    const mySlot = leagueSettings.teams.find((t) => t.teamId === leagueSettings.myTeamId)?.draftSlot;
    if (!mySlot) return [];
    return computeMyPickNumbers(
      leagueSettings.teamCount,
      leagueSettings.draftRounds,
      mySlot,
      leagueSettings.isSnakeDraft
    );
  }, [leagueSettings]);

  const upNext = nextMyPick(myPickNumbers, draftPicks.length);
  const picksAway = upNext ? upNext - draftPicks.length : null;

  if (cheatSheet.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        <p className="mb-2">Import a cheat sheet first so recommendations have something to rank.</p>
        <a href="/cheat-sheet" className="text-slate-200 underline">
          Go to Cheat Sheet →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Draft</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Auto-refreshing every {POLL_MS / 1000}s. Pick {draftPicks.length + 1} is on the clock.
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
        >
          Refresh now
        </button>
      </div>

      {error && <div className="text-red-300 text-sm">{error}</div>}

      {myTeamId && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-6 flex-wrap text-sm">
          <div>
            <div className="text-slate-500 text-xs uppercase">Your next pick</div>
            <div className="text-slate-100 font-semibold">
              {upNext ? `#${upNext}` : "Draft complete"}
              {picksAway !== null && picksAway > 0 && (
                <span className="text-slate-400 font-normal"> · {picksAway} pick{picksAway === 1 ? "" : "s"} away</span>
              )}
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            {Object.entries(needs).map(([pos, n]) => (
              <div key={pos} className={n > 0 ? "text-amber-300" : "text-slate-600"}>
                {pos}: {n} needed
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendation && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-5">
          <div className="text-xs uppercase text-emerald-400 font-semibold mb-1">Recommended pick</div>
          <div className="text-xl font-bold text-white">
            {recommendation.player.name}{" "}
            <span className="text-sm font-normal text-slate-400">
              ({recommendation.player.position} · {recommendation.player.team})
            </span>
          </div>
          <div className="text-sm text-slate-300 mt-1">{recommendation.reason}</div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200 mr-2">Best available</span>
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPosFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  posFilter === p
                    ? "bg-slate-100 text-slate-900 border-slate-100"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <PlayerTable rows={available} teams={leagueSettings?.teams} emptyMessage="Everyone in your cheat sheet has been drafted." />
        </div>

        <div className="space-y-3">
          <span className="text-sm font-semibold text-slate-200">Recent picks</span>
          <div className="rounded-lg border border-slate-800 divide-y divide-slate-800">
            {recentPicks.length === 0 && (
              <div className="p-4 text-sm text-slate-500">No picks yet.</div>
            )}
            {recentPicks.map(({ pick, player, team }) => (
              <div key={pick.overallPick} className="px-3 py-2 text-sm flex justify-between gap-2">
                <div>
                  <div className="text-slate-100">{player?.name ?? `Player #${pick.espnPlayerId}`}</div>
                  <div className="text-xs text-slate-500">
                    {team?.name ?? `Team ${pick.teamId}`} · Rd {pick.round}
                  </div>
                </div>
                <div className="text-slate-500 text-xs shrink-0">#{pick.overallPick}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
