// Server-side client for ESPN's unofficial Fantasy Football v3 API.
// Only ever import this from API routes / server components — it reads
// ESPN_S2 / ESPN_SWID from process.env, which must never reach the browser.
//
// Reference (reverse-engineered, no official docs): the same endpoints used
// by community libraries like cwendt94/espn-api.
import "server-only";
import type {
  DraftPick,
  EspnPlayer,
  EspnTeam,
  LeagueSettings,
  Position,
  RosterPlayer,
} from "./types";
import {
  DEMO_LEAGUE,
  DEMO_MY_TEAM_ID,
  demoDraftPicks,
  demoPlayers,
} from "./demoData";

const BASE = "https://fantasy.espn.com/apis/v3/games/ffl/seasons";

export function isDemoMode(): boolean {
  return !process.env.ESPN_LEAGUE_ID || !process.env.ESPN_SEASON;
}

function leagueId(): string {
  const id = process.env.ESPN_LEAGUE_ID;
  if (!id) throw new Error("ESPN_LEAGUE_ID is not set");
  return id;
}

function season(): number {
  const s = process.env.ESPN_SEASON;
  if (!s) throw new Error("ESPN_SEASON is not set");
  return Number(s);
}

export function myTeamId(): number | null {
  const t = process.env.ESPN_TEAM_ID;
  return t ? Number(t) : null;
}

function authHeaders(): Record<string, string> {
  const s2 = process.env.ESPN_S2;
  const swid = process.env.ESPN_SWID;
  if (!s2 || !swid) return {};
  const swidValue = swid.startsWith("{") ? swid : `{${swid}}`;
  return { Cookie: `espn_s2=${s2}; SWID=${swidValue}` };
}

async function espnFetch(path: string, extraHeaders: Record<string, string> = {}) {
  const url = `${BASE}/${season()}/segments/0/leagues/${leagueId()}${path}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(), ...extraHeaders },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `ESPN API request failed (${res.status} ${res.statusText}) for ${path}. ` +
        (res.status === 401 || res.status === 403
          ? "Check ESPN_S2 / ESPN_SWID are set correctly for a private league."
          : "Check ESPN_LEAGUE_ID / ESPN_SEASON are correct.")
    );
  }
  return res.json();
}

// --- lookup tables -------------------------------------------------------

const POSITION_BY_ID: Record<number, Position> = {
  0: "QB",
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  16: "DST",
};

const PRO_TEAM_ABBR: Record<number, string> = {
  0: "FA", 1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL",
  7: "DEN", 8: "DET", 9: "GB", 10: "TEN", 11: "IND", 12: "KC", 13: "LV",
  14: "LAR", 15: "MIA", 16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ",
  21: "PHI", 22: "ARI", 23: "PIT", 24: "LAC", 25: "SF", 26: "SEA", 27: "TB",
  28: "WSH", 29: "CAR", 30: "JAX", 33: "BAL", 34: "HOU",
};

// lineupSlotId -> our slot label
const SLOT_BY_ID: Record<number, string> = {
  0: "QB", 2: "RB", 3: "RB", 4: "WR", 5: "WR", 6: "TE", 7: "OP",
  16: "DST", 17: "K", 20: "BE", 21: "IR", 23: "FLEX",
};

function positionFor(defaultPositionId: number): Position {
  return POSITION_BY_ID[defaultPositionId] ?? "WR";
}

// --- public API ------------------------------------------------------------

export async function getLeagueSettings(): Promise<LeagueSettings> {
  if (isDemoMode()) return DEMO_LEAGUE;

  const data = await espnFetch("?view=mSettings&view=mTeam&view=mDraftDetail");

  const teams: EspnTeam[] = (data.teams ?? []).map((t: any) => ({
    teamId: t.id,
    name: t.name ?? (`${t.location ?? ""} ${t.nickname ?? ""}`.trim() || `Team ${t.id}`),
    draftSlot: null as number | null,
  }));

  // Infer draft slot per team from round-1 picks, if the draft has started.
  const picks: any[] = data.draftDetail?.picks ?? [];
  for (const p of picks) {
    if (p.roundId === 1) {
      const team = teams.find((t) => t.teamId === p.teamId);
      if (team) team.draftSlot = p.roundPickNumber;
    }
  }

  const slotCounts: Record<number, number> = data.settings?.rosterSettings?.lineupSlotCounts ?? {};
  const rosterSlots: Record<string, number> = {};
  for (const [slotId, count] of Object.entries(slotCounts)) {
    if (!count) continue;
    const label = SLOT_BY_ID[Number(slotId)];
    if (!label || label === "IR") continue;
    rosterSlots[label] = (rosterSlots[label] ?? 0) + (count as number);
  }

  return {
    leagueId: leagueId(),
    season: season(),
    name: data.settings?.name ?? "My League",
    teamCount: teams.length,
    myTeamId: myTeamId(),
    teams,
    rosterSlots,
    draftRounds: data.settings?.draftSettings?.pickOrder?.length
      ? data.draftDetail?.picks?.length
        ? Math.ceil(data.draftDetail.picks.length / teams.length)
        : 15
      : 15,
    isSnakeDraft: (data.settings?.draftSettings?.type ?? "SNAKE") === "SNAKE",
  };
}

/** The ~300 most-owned players, used as the draftable player universe. */
export async function getPlayerUniverse(): Promise<EspnPlayer[]> {
  if (isDemoMode()) return demoPlayers();

  const filter = {
    players: {
      limit: 400,
      sortPercOwned: { sortAsc: false, sortPriority: 1 },
    },
  };
  const url = `${BASE}/${season()}/segments/0/leagues/${leagueId()}?view=kona_player_info`;
  const res = await fetch(url, {
    headers: {
      ...authHeaders(),
      "x-fantasy-filter": JSON.stringify(filter),
      "x-fantasy-source": "kona",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ESPN player list request failed (${res.status})`);
  }
  const data = await res.json();
  const entries: any[] = data.players ?? [];

  return entries.map((e) => {
    const p = e.player;
    return {
      espnId: p.id,
      name: p.fullName,
      position: positionFor(p.defaultPositionId),
      proTeam: PRO_TEAM_ABBR[p.proTeamId] ?? "FA",
      byeWeek: null, // ESPN's schedule endpoint isn't wired up; comes from the rankings CSV instead
      drafted: !!e.onTeamId && e.onTeamId !== 0,
    } as EspnPlayer;
  });
}

export async function getDraftPicks(): Promise<DraftPick[]> {
  if (isDemoMode()) return demoDraftPicks();

  const data = await espnFetch("?view=mDraftDetail");
  const picks: any[] = data.draftDetail?.picks ?? [];
  return picks
    .filter((p) => p.playerId && p.playerId > 0)
    .map((p) => ({
      overallPick: p.overallPickNumber,
      round: p.roundId,
      roundPick: p.roundPickNumber,
      teamId: p.teamId,
      espnPlayerId: p.playerId,
    }));
}

export async function getRoster(teamId: number): Promise<RosterPlayer[]> {
  if (isDemoMode()) {
    // In demo mode there's no live roster endpoint; derive "my" roster from
    // picks made by the demo team, if any.
    const picks = demoDraftPicks().filter((p) => p.teamId === teamId);
    const players = demoPlayers();
    return picks.map((pick) => {
      const player = players.find((pl) => pl.espnId === pick.espnPlayerId)!;
      return {
        espnId: player.espnId,
        name: player.name,
        position: player.position,
        proTeam: player.proTeam,
        byeWeek: player.byeWeek,
        slot: player.position,
      };
    });
  }

  const data = await espnFetch(`?view=mRoster&view=mTeam`);
  const team = (data.teams ?? []).find((t: any) => t.id === teamId);
  const entries: any[] = team?.roster?.entries ?? [];
  return entries.map((entry) => {
    const p = entry.playerPoolEntry.player;
    return {
      espnId: p.id,
      name: p.fullName,
      position: positionFor(p.defaultPositionId),
      proTeam: PRO_TEAM_ABBR[p.proTeamId] ?? "FA",
      byeWeek: null,
      slot: SLOT_BY_ID[entry.lineupSlotId] ?? "BE",
    } as RosterPlayer;
  });
}

export { DEMO_MY_TEAM_ID };
