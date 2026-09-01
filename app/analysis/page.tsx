"use client";

import { useEffect, useMemo, useState } from "react";
import { useDraftStore } from "@/lib/store";
import { useEspnSync } from "@/lib/useEspnSync";
import { byeWeekConflicts, positionBalance } from "@/lib/draftLogic";
import type { RosterPlayer } from "@/lib/types";

export default function AnalysisPage() {
  const { loading, error, leagueSettings } = useEspnSync();
  const cheatSheet = useDraftStore((s) => s.cheatSheet);
  const draftPicks = useDraftStore((s) => s.draftPicks);

  const [roster, setRoster] = useState<RosterPlayer[] | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const myTeamId = leagueSettings?.myTeamId ?? null;

  useEffect(() => {
    if (!myTeamId) return;
    fetch(`/api/espn/roster?teamId=${myTeamId}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load roster");
        setRoster(json.roster);
      })
      .catch((e) => setRosterError(e.message));
  }, [myTeamId]);

  const balance = useMemo<Record<string, number>>(
    () => (roster ? positionBalance(roster) : {}),
    [roster]
  );
  const conflicts = useMemo(() => (roster ? byeWeekConflicts(roster) : []), [roster]);

  const valuePicks = useMemo(() => {
    if (!roster || !myTeamId) return [];
    const rankByEspnId = new Map(cheatSheet.filter((c) => c.espnId).map((c) => [c.espnId, c.rank]));
    return roster
      .map((p) => {
        const pick = draftPicks.find((pk) => pk.teamId === myTeamId && pk.espnPlayerId === p.espnId);
        const rank = rankByEspnId.get(p.espnId);
        if (!pick || rank === undefined) return null;
        return { player: p, pickNumber: pick.overallPick, rank, diff: pick.overallPick - rank };
      })
      .filter((v): v is NonNullable<typeof v> => !!v)
      .sort((a, b) => b.diff - a.diff);
  }, [roster, draftPicks, cheatSheet, myTeamId]);

  const avgDiff = valuePicks.length
    ? valuePicks.reduce((sum, v) => sum + v.diff, 0) / valuePicks.length
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Team</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Roster, bye-week conflicts, and a rough draft-value read based on your cheat sheet ranks.
        </p>
      </div>

      {(loading || (myTeamId && !roster && !rosterError)) && (
        <div className="text-slate-400 text-sm">Loading your roster…</div>
      )}
      {error && <div className="text-red-300 text-sm">{error}</div>}
      {rosterError && <div className="text-red-300 text-sm">{rosterError}</div>}
      {!myTeamId && !loading && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          No team is configured. Set <code>ESPN_TEAM_ID</code> in <code>.env.local</code> (see Setup) to
          see your own roster here.
        </div>
      )}

      {roster && roster.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No players on this roster yet — check back once you&apos;ve made some picks.
        </div>
      )}

      {roster && roster.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="font-semibold text-slate-100 mb-3">Position balance</div>
              <div className="space-y-1 text-sm">
                {Object.entries(balance).map(([pos, count]) => (
                  <div key={pos} className="flex justify-between text-slate-300">
                    <span>{pos}</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="font-semibold text-slate-100 mb-3">Bye-week conflicts</div>
              {conflicts.length === 0 ? (
                <div className="text-sm text-slate-500">None — starters are spread across byes.</div>
              ) : (
                <div className="space-y-2 text-sm">
                  {conflicts.map((c, i) => (
                    <div key={i} className="text-amber-300">
                      Week {c.week}: {c.players.length} {c.position}s ({c.players.join(", ")})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {valuePicks.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-100">Draft value</div>
                {avgDiff !== null && (
                  <div className={`text-sm font-medium ${avgDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    Avg {avgDiff >= 0 ? "+" : ""}
                    {avgDiff.toFixed(1)} picks vs. your ranks
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Positive = you got the player later than their cheat-sheet rank (a steal). Negative =
                you picked them earlier (a reach). Only players matched to your imported rankings are
                shown.
              </div>
              <div className="divide-y divide-slate-800 text-sm">
                {valuePicks.map((v) => (
                  <div key={v.player.espnId} className="flex justify-between py-1.5">
                    <span className="text-slate-200">{v.player.name}</span>
                    <span className="text-slate-500">
                      Pick #{v.pickNumber} · Ranked #{v.rank} ·{" "}
                      <span className={v.diff >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {v.diff >= 0 ? "+" : ""}
                        {v.diff}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="font-semibold text-slate-100 mb-3">Full roster</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              {roster.map((p) => (
                <div key={p.espnId} className="flex justify-between px-3 py-2 rounded-md bg-slate-900/60">
                  <span className="text-slate-200">{p.name}</span>
                  <span className="text-slate-500">
                    {p.position} · {p.proTeam} · Bye {p.byeWeek ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
