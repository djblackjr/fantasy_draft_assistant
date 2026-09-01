// Pure functions that turn (cheat sheet + league roster rules + picks so
// far) into "what should I do next" answers. No fetching, no state — easy
// to unit-test and reused by both the live draft page and post-draft page.
import type { CheatSheetPlayer, Position, RosterPlayer } from "./types";

const STARTER_POSITIONS: Position[] = ["QB", "RB", "WR", "TE", "DST", "K"];

export function bestAvailable(
  cheatSheet: CheatSheetPlayer[],
  position: Position | "ALL" = "ALL",
  limit = 25
): CheatSheetPlayer[] {
  return cheatSheet
    .filter((p) => !p.drafted && (position === "ALL" || p.position === position))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);
}

/** How many of each roster slot a team still needs to fill, given what
 * they've drafted so far. FLEX is treated as satisfied by any leftover
 * RB/WR/TE once their dedicated slots are full. */
export function positionNeeds(
  rosterSlots: Record<string, number>,
  drafted: { position: Position }[]
): Record<Position, number> {
  const counts: Record<string, number> = {};
  for (const p of drafted) counts[p.position] = (counts[p.position] ?? 0) + 1;

  const needs: Partial<Record<Position, number>> = {};
  for (const pos of STARTER_POSITIONS) {
    const required = rosterSlots[pos] ?? 0;
    const have = counts[pos] ?? 0;
    needs[pos] = Math.max(0, required - have);
  }

  // FLEX need: filled by RB/WR/TE beyond their dedicated slot requirements
  const flexSlots = rosterSlots["FLEX"] ?? 0;
  const flexEligibleSurplus =
    Math.max(0, (counts["RB"] ?? 0) - (rosterSlots["RB"] ?? 0)) +
    Math.max(0, (counts["WR"] ?? 0) - (rosterSlots["WR"] ?? 0)) +
    Math.max(0, (counts["TE"] ?? 0) - (rosterSlots["TE"] ?? 0));
  needs["FLEX"] = Math.max(0, flexSlots - flexEligibleSurplus);

  return needs as Record<Position, number>;
}

export interface Recommendation {
  player: CheatSheetPlayer;
  reason: string;
}

/** Simple, explainable recommendation: fill an unmet starter need with the
 * best-ranked available player at that position; if every starter slot is
 * covered, just take the best player available (best-player-available /
 * bench value). */
export function recommendPick(
  cheatSheet: CheatSheetPlayer[],
  needs: Record<Position, number>
): Recommendation | null {
  const available = cheatSheet.filter((p) => !p.drafted).sort((a, b) => a.rank - b.rank);
  if (available.length === 0) return null;

  const neededPositions = (Object.entries(needs) as [Position, number][])
    .filter(([pos, n]) => n > 0 && pos !== "FLEX")
    .map(([pos]) => pos);

  if (neededPositions.length > 0) {
    const best = available.find((p) => neededPositions.includes(p.position));
    if (best) {
      return {
        player: best,
        reason: `Fills your open ${best.position} slot — highest ranked ${best.position} still available (#${best.rank} overall).`,
      };
    }
  }

  if ((needs.FLEX ?? 0) > 0) {
    const flexEligible = available.find((p) => ["RB", "WR", "TE"].includes(p.position));
    if (flexEligible) {
      return {
        player: flexEligible,
        reason: `Fills your FLEX slot — highest ranked FLEX-eligible player still available (#${flexEligible.rank} overall).`,
      };
    }
  }

  const top = available[0];
  return {
    player: top,
    reason: "Starting lineup needs are covered — best player available for depth/upside.",
  };
}

export interface ByeConflict {
  week: number;
  position: Position;
  players: string[];
}

/** Flags cases where 3+ rostered players at the same starter position share
 * a bye week — the classic "I have no RBs in week 9" problem. */
export function byeWeekConflicts(roster: RosterPlayer[]): ByeConflict[] {
  const groups = new Map<string, RosterPlayer[]>();
  for (const p of roster) {
    if (p.byeWeek == null) continue;
    const key = `${p.position}-${p.byeWeek}`;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }
  const conflicts: ByeConflict[] = [];
  for (const [key, players] of groups) {
    if (players.length >= 3) {
      const [position, week] = key.split("-");
      conflicts.push({
        week: Number(week),
        position: position as Position,
        players: players.map((p) => p.name),
      });
    }
  }
  return conflicts.sort((a, b) => a.week - b.week);
}

export function positionBalance(roster: RosterPlayer[]): Record<Position, number> {
  const counts: Partial<Record<Position, number>> = {};
  for (const p of roster) counts[p.position] = (counts[p.position] ?? 0) + 1;
  return counts as Record<Position, number>;
}

/** Every overall pick number that belongs to `mySlot` (1-indexed draft
 * position) across a snake (or straight) draft. */
export function computeMyPickNumbers(
  teamCount: number,
  rounds: number,
  mySlot: number,
  isSnake: boolean
): number[] {
  const picks: number[] = [];
  for (let round = 1; round <= rounds; round++) {
    const reversed = isSnake && round % 2 === 0;
    const roundPick = reversed ? teamCount - mySlot + 1 : mySlot;
    picks.push((round - 1) * teamCount + roundPick);
  }
  return picks;
}

export function nextMyPick(myPickNumbers: number[], picksMadeSoFar: number): number | null {
  const next = myPickNumbers.find((n) => n > picksMadeSoFar);
  return next ?? null;
}
