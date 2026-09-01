"use client";

import type { CheatSheetPlayer, EspnTeam } from "@/lib/types";

const POS_COLOR: Record<string, string> = {
  QB: "bg-purple-500/20 text-purple-300",
  RB: "bg-emerald-500/20 text-emerald-300",
  WR: "bg-blue-500/20 text-blue-300",
  TE: "bg-orange-500/20 text-orange-300",
  DST: "bg-slate-500/20 text-slate-300",
  K: "bg-pink-500/20 text-pink-300",
  FLEX: "bg-yellow-500/20 text-yellow-300",
};

interface Props {
  rows: CheatSheetPlayer[];
  editable?: boolean;
  onUpdate?: (id: string, patch: Partial<CheatSheetPlayer>) => void;
  teams?: EspnTeam[];
  emptyMessage?: string;
}

export default function PlayerTable({ rows, editable, onUpdate, teams, emptyMessage }: Props) {
  const teamName = (id: number | null) =>
    id ? teams?.find((t) => t.teamId === id)?.name ?? `Team ${id}` : null;

  if (rows.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-lg">
        {emptyMessage ?? "No players to show."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-3 py-2 w-14">Rank</th>
            {editable && <th className="text-left px-3 py-2 w-16">Tier</th>}
            <th className="text-left px-3 py-2">Player</th>
            <th className="text-left px-3 py-2 w-16">Pos</th>
            <th className="text-left px-3 py-2 w-16">Team</th>
            <th className="text-left px-3 py-2 w-14">Bye</th>
            <th className="text-left px-3 py-2">Status</th>
            {editable && <th className="text-left px-3 py-2">Notes</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={row.drafted ? "opacity-40 bg-slate-900/40" : "hover:bg-slate-900/60"}
            >
              <td className="px-3 py-2 text-slate-400 tabular-nums">{row.rank}</td>
              {editable && (
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.tier}
                    onChange={(e) => onUpdate?.(row.id, { tier: Number(e.target.value) })}
                    className="w-12 bg-slate-800 rounded px-1 py-0.5 text-slate-200"
                  />
                </td>
              )}
              <td className="px-3 py-2 font-medium text-slate-100">
                {row.name}
                {!row.espnId && (
                  <span title="Couldn't match this row to an ESPN player" className="ml-1 text-amber-400">
                    ⚠
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${POS_COLOR[row.position] ?? ""}`}>
                  {row.position}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-400">{row.team}</td>
              <td className="px-3 py-2 text-slate-400">{row.byeWeek ?? "—"}</td>
              <td className="px-3 py-2 text-xs">
                {row.drafted ? (
                  <span className="text-red-400">
                    Drafted{teamName(row.draftedByTeamId) ? ` · ${teamName(row.draftedByTeamId)}` : ""}
                  </span>
                ) : (
                  <span className="text-emerald-400">Available</span>
                )}
              </td>
              {editable && (
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => onUpdate?.(row.id, { notes: e.target.value })}
                    placeholder="—"
                    className="w-full bg-slate-800 rounded px-2 py-1 text-slate-200 placeholder:text-slate-600"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
