"use client";

import { useMemo, useRef, useState } from "react";
import { useDraftStore } from "@/lib/store";
import { useEspnSync } from "@/lib/useEspnSync";
import PlayerTable from "@/components/PlayerTable";
import type { Position } from "@/lib/types";

const POSITIONS: (Position | "ALL")[] = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"];

export default function CheatSheetPage() {
  const { loading, error, leagueSettings } = useEspnSync();
  const cheatSheet = useDraftStore((s) => s.cheatSheet);
  const importCsv = useDraftStore((s) => s.importCheatSheetCsv);
  const updateRow = useDraftStore((s) => s.updateCheatSheetRow);
  const clearSheet = useDraftStore((s) => s.clearCheatSheet);
  const warnings = useDraftStore((s) => s.lastImportWarnings);

  const [posFilter, setPosFilter] = useState<Position | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importCsv(text);
    e.target.value = "";
  }

  const filtered = useMemo(() => {
    return cheatSheet
      .filter((p) => posFilter === "ALL" || p.position === posFilter)
      .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [cheatSheet, posFilter, query]);

  const unmatched = cheatSheet.filter((p) => !p.espnId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Cheat Sheet</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Import your rankings, adjust tiers and notes. Drafted status updates live once you
            open the Live Draft page.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
          >
            Import CSV
          </button>
          {cheatSheet.length > 0 && (
            <button
              onClick={() => confirm("Clear the whole cheat sheet?") && clearSheet()}
              className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-slate-400 text-sm">Loading player data from ESPN…</div>}
      {error && <div className="text-red-300 text-sm">{error}</div>}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200 space-y-1">
          {warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}

      {unmatched > 0 && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-2 text-xs text-amber-300">
          {unmatched} player{unmatched === 1 ? "" : "s"} couldn&apos;t be matched to an ESPN
          player (name mismatch or off-roster) — they still show up but won&apos;t auto-update as
          drafted.
        </div>
      )}

      {cheatSheet.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          <p className="mb-3">No rankings imported yet.</p>
          <p className="text-sm">
            Import a CSV export from FantasyPros (or similar) — columns like{" "}
            <code className="text-slate-300">Rank</code>, <code className="text-slate-300">Player Name</code>,{" "}
            <code className="text-slate-300">Team</code>, <code className="text-slate-300">Position</code>,{" "}
            <code className="text-slate-300">Bye</code> are auto-detected. A sample file lives at{" "}
            <code className="text-slate-300">data/sample-rankings.csv</code> in the repo if you want to try it first.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
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
            <input
              type="text"
              placeholder="Search player…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-auto bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <PlayerTable
            rows={filtered}
            editable
            onUpdate={updateRow}
            teams={leagueSettings?.teams}
          />
        </>
      )}
    </div>
  );
}
