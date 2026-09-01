// Parses rankings CSVs (the shape FantasyPros and similar sites export) into
// CheatSheetPlayer rows. Column names vary by source, so we match loosely.
import Papa from "papaparse";
import type { CheatSheetPlayer, Position } from "./types";

const POSITIONS: Position[] = ["QB", "RB", "WR", "TE", "DST", "K"];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function pick(row: Record<string, string>, headerMap: Record<string, string>, ...candidates: string[]) {
  for (const c of candidates) {
    const actualHeader = headerMap[c];
    if (actualHeader !== undefined && row[actualHeader] !== undefined && row[actualHeader] !== "") {
      return row[actualHeader];
    }
  }
  return undefined;
}

function extractPosition(raw: string | undefined): Position {
  if (!raw) return "WR";
  // FantasyPros often encodes rank-within-position here, e.g. "RB12" or "WR1"
  const match = raw.trim().toUpperCase().match(/^([A-Z/]+)/);
  const token = (match?.[1] ?? raw).replace("D/ST", "DST").replace("DEF", "DST");
  const found = POSITIONS.find((p) => token.startsWith(p));
  return found ?? "WR";
}

function slugId(name: string, index: number): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
}

export interface ParseResult {
  players: CheatSheetPlayer[];
  warnings: string[];
}

export function parseRankingsCsv(csvText: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const warnings: string[] = [];
  if (parsed.errors.length) {
    warnings.push(...parsed.errors.slice(0, 3).map((e) => `Row ${e.row}: ${e.message}`));
  }

  const headers = parsed.meta.fields ?? [];
  const headerMap: Record<string, string> = {};
  for (const h of headers) headerMap[normalizeHeader(h)] = h;

  const players: CheatSheetPlayer[] = [];
  let autoRank = 0;

  for (const row of parsed.data) {
    const name = pick(row, headerMap, "playername", "player", "name")?.trim();
    if (!name) continue;

    autoRank += 1;
    const rankRaw = pick(row, headerMap, "rk", "rank", "overallrank", "ecrrank");
    const tierRaw = pick(row, headerMap, "tiers", "tier");
    const posRaw = pick(row, headerMap, "pos", "position");
    const teamRaw = pick(row, headerMap, "team", "tm") ?? "";
    const byeRaw = pick(row, headerMap, "byeweek", "bye");

    const rank = rankRaw ? Number(rankRaw) : autoRank;
    const tier = tierRaw ? Number(tierRaw) : Math.max(1, Math.ceil((Number.isFinite(rank) ? rank : autoRank) / 12));
    const bye = byeRaw ? Number(byeRaw) : null;

    players.push({
      id: slugId(name, autoRank),
      name,
      position: extractPosition(posRaw),
      team: teamRaw.trim().toUpperCase(),
      rank: Number.isFinite(rank) ? rank : autoRank,
      tier: Number.isFinite(tier) ? tier : 1,
      byeWeek: bye && Number.isFinite(bye) ? bye : null,
      notes: "",
      espnId: null,
      drafted: false,
      draftedByTeamId: null,
    });
  }

  players.sort((a, b) => a.rank - b.rank);
  if (players.length === 0) {
    warnings.push(
      "No player rows recognized — expected a column like 'Player Name' (or 'Player'/'Name')."
    );
  }
  return { players, warnings };
}
