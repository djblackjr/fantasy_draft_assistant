// Matches cheat-sheet rows (from an imported rankings CSV) to ESPN player
// identities, so drafted-status and live-draft filtering work off one id.
import type { CheatSheetPlayer, EspnPlayer } from "./types";

const SUFFIXES = /\b(jr|sr|ii|iii|iv|v)\.?$/i;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[.']/g, "")
    .replace(SUFFIXES, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MatchResult {
  matched: CheatSheetPlayer[];
  unmatchedCount: number;
}

/** Returns a new array of cheat-sheet players with espnId filled in where a
 * confident match was found (exact normalized-name match, position as a
 * tiebreaker when a name collides across positions). Team-name rows (DST)
 * match on team abbreviation instead of name. */
export function matchToEspn(
  cheatSheet: CheatSheetPlayer[],
  espnPlayers: EspnPlayer[]
): MatchResult {
  const byName = new Map<string, EspnPlayer[]>();
  const byTeamDst = new Map<string, EspnPlayer>();
  for (const p of espnPlayers) {
    if (p.position === "DST") {
      byTeamDst.set(p.proTeam, p);
      continue;
    }
    const key = normalizeName(p.name);
    const list = byName.get(key) ?? [];
    list.push(p);
    byName.set(key, list);
  }

  let unmatchedCount = 0;
  const matched = cheatSheet.map((row) => {
    if (row.espnId) return row;

    let candidate: EspnPlayer | undefined;
    if (row.position === "DST") {
      candidate = byTeamDst.get(row.team);
    } else {
      const key = normalizeName(row.name);
      const list = byName.get(key);
      candidate = list?.find((p) => p.position === row.position) ?? list?.[0];
    }

    if (!candidate) {
      unmatchedCount += 1;
      return row;
    }
    return {
      ...row,
      espnId: candidate.espnId,
      byeWeek: row.byeWeek ?? candidate.byeWeek,
    };
  });

  return { matched, unmatchedCount };
}
