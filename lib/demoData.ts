// Fixture data so the app is fully usable without a real ESPN league —
// useful for trying it out, and for development/testing.
import type {
  DraftPick,
  EspnPlayer,
  EspnTeam,
  LeagueSettings,
  Position,
} from "./types";

interface RawPlayer {
  name: string;
  position: Position;
  team: string;
  bye: number;
}

// A representative top-~90 draft pool spanning all rostered positions.
// Ranked roughly best-to-worst within the demo pool (order below = rank).
const RAW_PLAYERS: RawPlayer[] = [
  { name: "Christian McCaffrey", position: "RB", team: "SF", bye: 9 },
  { name: "Bijan Robinson", position: "RB", team: "ATL", bye: 12 },
  { name: "CeeDee Lamb", position: "WR", team: "DAL", bye: 7 },
  { name: "Tyreek Hill", position: "WR", team: "MIA", bye: 6 },
  { name: "Breece Hall", position: "RB", team: "NYJ", bye: 12 },
  { name: "Ja'Marr Chase", position: "WR", team: "CIN", bye: 12 },
  { name: "Justin Jefferson", position: "WR", team: "MIN", bye: 6 },
  { name: "Amon-Ra St. Brown", position: "WR", team: "DET", bye: 5 },
  { name: "Jahmyr Gibbs", position: "RB", team: "DET", bye: 5 },
  { name: "Saquon Barkley", position: "RB", team: "PHI", bye: 5 },
  { name: "Garrett Wilson", position: "WR", team: "NYJ", bye: 12 },
  { name: "A.J. Brown", position: "WR", team: "PHI", bye: 5 },
  { name: "Puka Nacua", position: "WR", team: "LAR", bye: 6 },
  { name: "Jonathan Taylor", position: "RB", team: "IND", bye: 14 },
  { name: "De'Von Achane", position: "RB", team: "MIA", bye: 6 },
  { name: "Josh Allen", position: "QB", team: "BUF", bye: 7 },
  { name: "Patrick Mahomes", position: "QB", team: "KC", bye: 10 },
  { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", bye: 11 },
  { name: "Nico Collins", position: "WR", team: "HOU", bye: 14 },
  { name: "Drake London", position: "WR", team: "ATL", bye: 12 },
  { name: "Kyren Williams", position: "RB", team: "LAR", bye: 6 },
  { name: "Derrick Henry", position: "RB", team: "BAL", bye: 7 },
  { name: "Malik Nabers", position: "WR", team: "NYG", bye: 11 },
  { name: "Jaylen Waddle", position: "WR", team: "MIA", bye: 6 },
  { name: "Chris Olave", position: "WR", team: "NO", bye: 11 },
  { name: "DK Metcalf", position: "WR", team: "PIT", bye: 9 },
  { name: "Brian Thomas Jr.", position: "WR", team: "JAX", bye: 8 },
  { name: "Josh Jacobs", position: "RB", team: "GB", bye: 10 },
  { name: "Bucky Irving", position: "RB", team: "TB", bye: 9 },
  { name: "Isiah Pacheco", position: "RB", team: "KC", bye: 10 },
  { name: "Lamar Jackson", position: "QB", team: "BAL", bye: 7 },
  { name: "Jalen Hurts", position: "QB", team: "PHI", bye: 5 },
  { name: "Sam LaPorta", position: "TE", team: "DET", bye: 5 },
  { name: "Trey McBride", position: "TE", team: "ARI", bye: 11 },
  { name: "Brock Bowers", position: "TE", team: "LV", bye: 8 },
  { name: "George Kittle", position: "TE", team: "SF", bye: 9 },
  { name: "Mark Andrews", position: "TE", team: "BAL", bye: 7 },
  { name: "Rachaad White", position: "RB", team: "TB", bye: 9 },
  { name: "James Cook", position: "RB", team: "BUF", bye: 7 },
  { name: "Kenneth Walker III", position: "RB", team: "SEA", bye: 10 },
  { name: "Alvin Kamara", position: "RB", team: "NO", bye: 11 },
  { name: "Joe Mixon", position: "RB", team: "HOU", bye: 14 },
  { name: "Tank Bigsby", position: "RB", team: "JAX", bye: 8 },
  { name: "DJ Moore", position: "WR", team: "CHI", bye: 5 },
  { name: "Terry McLaurin", position: "WR", team: "WSH", bye: 14 },
  { name: "Cooper Kupp", position: "WR", team: "SEA", bye: 10 },
  { name: "Davante Adams", position: "WR", team: "LAR", bye: 6 },
  { name: "Mike Evans", position: "WR", team: "TB", bye: 9 },
  { name: "Rome Odunze", position: "WR", team: "CHI", bye: 5 },
  { name: "Ladd McConkey", position: "WR", team: "LAC", bye: 12 },
  { name: "Xavier Worthy", position: "WR", team: "KC", bye: 10 },
  { name: "Jayden Daniels", position: "QB", team: "WSH", bye: 14 },
  { name: "Joe Burrow", position: "QB", team: "CIN", bye: 12 },
  { name: "C.J. Stroud", position: "QB", team: "HOU", bye: 14 },
  { name: "Jordan Love", position: "QB", team: "GB", bye: 10 },
  { name: "Anthony Richardson", position: "QB", team: "IND", bye: 14 },
  { name: "Dak Prescott", position: "QB", team: "DAL", bye: 7 },
  { name: "Kyler Murray", position: "QB", team: "ARI", bye: 11 },
  { name: "Zay Flowers", position: "WR", team: "BAL", bye: 7 },
  { name: "Tee Higgins", position: "WR", team: "CIN", bye: 12 },
  { name: "Jameson Williams", position: "WR", team: "DET", bye: 5 },
  { name: "Jerry Jeudy", position: "WR", team: "CLE", bye: 9 },
  { name: "Courtland Sutton", position: "WR", team: "DEN", bye: 12 },
  { name: "Najee Harris", position: "RB", team: "LAC", bye: 12 },
  { name: "Aaron Jones", position: "RB", team: "MIN", bye: 6 },
  { name: "Tony Pollard", position: "RB", team: "TEN", bye: 10 },
  { name: "Rhamondre Stevenson", position: "RB", team: "NE", bye: 14 },
  { name: "Javonte Williams", position: "RB", team: "DAL", bye: 7 },
  { name: "Chuba Hubbard", position: "RB", team: "CAR", bye: 14 },
  { name: "Evan Engram", position: "TE", team: "DEN", bye: 12 },
  { name: "Dallas Goedert", position: "TE", team: "PHI", bye: 5 },
  { name: "David Njoku", position: "TE", team: "CLE", bye: 9 },
  { name: "Jake Ferguson", position: "TE", team: "DAL", bye: 7 },
  { name: "Kyle Pitts", position: "TE", team: "ATL", bye: 12 },
  { name: "Baltimore Ravens", position: "DST", team: "BAL", bye: 7 },
  { name: "San Francisco 49ers", position: "DST", team: "SF", bye: 9 },
  { name: "Dallas Cowboys", position: "DST", team: "DAL", bye: 7 },
  { name: "Pittsburgh Steelers", position: "DST", team: "PIT", bye: 9 },
  { name: "Philadelphia Eagles", position: "DST", team: "PHI", bye: 5 },
  { name: "Justin Tucker", position: "K", team: "BAL", bye: 7 },
  { name: "Harrison Butker", position: "K", team: "KC", bye: 10 },
  { name: "Brandon Aubrey", position: "K", team: "DAL", bye: 7 },
  { name: "Tyler Bass", position: "K", team: "BUF", bye: 7 },
  { name: "Jake Elliott", position: "K", team: "PHI", bye: 5 },
  { name: "Herbert Justin", position: "QB", team: "LAC", bye: 12 },
  { name: "Trevor Lawrence", position: "QB", team: "JAX", bye: 8 },
  { name: "Deebo Samuel", position: "WR", team: "SF", bye: 9 },
  { name: "Diontae Johnson", position: "WR", team: "BAL", bye: 7 },
  { name: "Keenan Allen", position: "WR", team: "CHI", bye: 5 },
  { name: "Zamir White", position: "RB", team: "LV", bye: 8 },
];

export const DEMO_LEAGUE_ID = "demo";
export const DEMO_SEASON = 2026;
export const DEMO_MY_TEAM_ID = 1;

export const DEMO_TEAMS: EspnTeam[] = [
  { teamId: 1, name: "Your Team", draftSlot: 3 },
  { teamId: 2, name: "Gridiron Gurus", draftSlot: 1 },
  { teamId: 3, name: "Waiver Wire Wizards", draftSlot: 2 },
  { teamId: 4, name: "Hail Mary Heroes", draftSlot: 4 },
  { teamId: 5, name: "Blitz Kids", draftSlot: 5 },
  { teamId: 6, name: "End Zone Enforcers", draftSlot: 6 },
  { teamId: 7, name: "Fumble Bunch", draftSlot: 7 },
  { teamId: 8, name: "Red Zone Raiders", draftSlot: 8 },
  { teamId: 9, name: "Pigskin Prophets", draftSlot: 9 },
  { teamId: 10, name: "Turf Titans", draftSlot: 10 },
];

export const DEMO_LEAGUE: LeagueSettings = {
  leagueId: DEMO_LEAGUE_ID,
  season: DEMO_SEASON,
  name: "Demo League (fixture data)",
  teamCount: 10,
  myTeamId: DEMO_MY_TEAM_ID,
  teams: DEMO_TEAMS,
  rosterSlots: { QB: 1, RB: 2, WR: 2, FLEX: 1, TE: 1, DST: 1, K: 1, BE: 6 },
  draftRounds: 15,
  isSnakeDraft: true,
};

// A few sample injury designations so demo mode shows the feature —
// including on "Your Team"'s three drafted players (CeeDee Lamb, Marvin
// Harrison Jr., Malik Nabers), so /analysis has something to report.
const DEMO_INJURY_STATUSES: Record<string, EspnPlayer["injuryStatus"]> = {
  "CeeDee Lamb": "ACTIVE",
  "Marvin Harrison Jr.": "QUESTIONABLE",
  "Malik Nabers": "OUT",
  "Christian McCaffrey": "DOUBTFUL",
  "Breece Hall": "QUESTIONABLE",
};

export function demoPlayers(): EspnPlayer[] {
  return RAW_PLAYERS.map((p, i) => ({
    espnId: 100000 + i,
    name: p.name,
    position: p.position,
    proTeam: p.team,
    byeWeek: p.bye,
    drafted: false,
    injuryStatus: DEMO_INJURY_STATUSES[p.name] ?? "ACTIVE",
  }));
}

/** Simulates the first 2.5 rounds (25 picks) of a 10-team snake draft already
 * having happened, so the live draft view has something interesting to show. */
export function demoDraftPicks(): DraftPick[] {
  const players = demoPlayers();
  const picks: DraftPick[] = [];
  const picksMade = 25;
  for (let overall = 1; overall <= picksMade; overall++) {
    const round = Math.ceil(overall / 10);
    const posInRound = overall - (round - 1) * 10; // 1..10
    // snake: odd rounds go slot 1..10, even rounds go 10..1
    const slot = round % 2 === 1 ? posInRound : 11 - posInRound;
    const team = DEMO_TEAMS.find((t) => t.draftSlot === slot)!;
    // team 1 ("Your Team") is drafted for a bit by the assistant demo too,
    // just skip their normal picks so /draft can show a live recommendation
    const player = players[overall - 1];
    picks.push({
      overallPick: overall,
      round,
      roundPick: posInRound,
      teamId: team.teamId,
      espnPlayerId: player.espnId,
    });
  }
  return picks;
}
