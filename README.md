# Fantasy Draft Assistant

A local web app for ESPN fantasy football drafts: import your rankings into
a tiered cheat sheet, get a live best-available/recommended-pick feed during
your actual draft, and review your roster afterward (position balance,
bye-week conflicts, draft-value grade).

Runs entirely on your own machine — nothing is deployed or shared. Your
ESPN cookies stay in a local, gitignored `.env.local` file and are only ever
sent from this server to `fantasy.espn.com`.

## Features

- **Cheat Sheet** — import a rankings CSV (e.g. a FantasyPros export),
  auto-matched to ESPN's player IDs, with editable tiers and notes.
- **Live Draft** — polls your league's live draft every few seconds, shows
  recent picks, best players still available, your positional needs, and a
  recommended next pick with a one-line explanation.
- **My Team** — after picks are made, shows your roster's position balance,
  bye-week clustering, and how each pick graded against your own rankings.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `.env.local`, the app runs in **demo
mode** using built-in fixture data — a fake 10-team league and player pool —
so you can try every page immediately.

### Connecting your real ESPN league

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Find your league ID and your own team ID from your league's URL, e.g.
   `https://fantasy.espn.com/football/team?leagueId=123456&teamId=3`:
   - `ESPN_LEAGUE_ID=123456`
   - `ESPN_TEAM_ID=3`
   - `ESPN_SEASON=2026`
3. **Private leagues only** — ESPN's API needs your session cookies to read
   a private league:
   1. Log in to fantasy.espn.com in your browser and open your league.
   2. Open DevTools → Application (Chrome) / Storage (Firefox) → Cookies →
      `https://fantasy.espn.com`.
   3. Copy the `espn_s2` and `SWID` cookie values into `ESPN_S2` and
      `ESPN_SWID` in `.env.local`.
   4. These act like a login session — don't share them, and don't commit
      `.env.local` (it's gitignored already). They typically expire after a
      few weeks/months, so you may need to refresh them later in the season.
4. Restart `npm run dev` so the new environment variables load, then check
   the **Setup** page to confirm the connection.

### Trying the cheat sheet import

A sample rankings file is included at `data/sample-rankings.csv` — import it
from the Cheat Sheet page to see the format the parser expects. It loosely
matches common column names (`Rank`/`RK`, `Player Name`/`Player`, `Team`,
`Position`/`Pos`, `Bye`/`Bye Week`, `Tier`/`Tiers`), so most fantasy sites'
CSV exports should import without changes.

## How it works

- All ESPN calls happen server-side (Next.js API routes under
  `app/api/espn/*`), using ESPN's unofficial `v3` fantasy API — the same
  endpoints used by community tools since ESPN has no official public API
  for this. Endpoints and field names could change without notice.
- The cheat sheet is stored in your browser's `localStorage` (via Zustand),
  so it persists across restarts but never leaves your machine.
- Bye weeks come from your imported rankings CSV rather than ESPN's
  schedule API (which isn't wired up here) — most ranking exports already
  include them.
- The "recommended pick" logic is simple and explainable: it fills your
  highest-priority unmet starting slot with the best-ranked available
  player there, and falls back to best-player-available once your starting
  lineup is covered. It's a heuristic, not a projection model — treat it as
  a second opinion, not an oracle.

## Project structure

```
app/
  api/espn/          server-side ESPN API routes (league, players, draft, roster)
  setup/              connection status + instructions
  cheat-sheet/        rankings import + tier editor
  draft/              live draft board
  analysis/           post-draft roster review
lib/
  espn.ts             ESPN API client (server-only)
  demoData.ts          fixture data for demo mode
  rankings.ts          CSV parsing
  match.ts             cheat-sheet <-> ESPN player matching
  draftLogic.ts         best-available / needs / recommendation / bye conflicts
  store.ts              client-side state (Zustand + localStorage)
```

## Tech stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand + PapaParse.
No backend/database beyond the Next.js server itself — it's designed to run
on your laptop for the duration of your draft.
