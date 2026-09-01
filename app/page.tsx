import Link from "next/link";
import { getLeagueSettings, isDemoMode } from "@/lib/espn";

// This reads live env config + calls ESPN on every request — never
// statically prerender it (a `next build` run before .env.local is set
// would otherwise bake in stale demo-mode content).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const demo = isDemoMode();
  let leagueName = "Unknown";
  let teamCount = 0;
  let error: string | null = null;
  try {
    const settings = await getLeagueSettings();
    leagueName = settings.name;
    teamCount = settings.teamCount;
  } catch (e: any) {
    error = e.message;
  }

  const cards = [
    {
      href: "/cheat-sheet",
      title: "Cheat Sheet",
      body: "Import your rankings CSV and build a tiered draft board.",
      emoji: "📋",
    },
    {
      href: "/draft",
      title: "Live Draft",
      body: "Track picks in real time and get a recommended pick every turn.",
      emoji: "🎯",
    },
    {
      href: "/analysis",
      title: "My Team",
      body: "After the draft: position balance, bye-week conflicts, grade.",
      emoji: "📊",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Fantasy Draft Assistant</h1>
        <p className="text-slate-400 mt-1">
          Connected to <span className="text-slate-200 font-medium">{leagueName}</span>
          {teamCount ? ` · ${teamCount} teams` : ""}
        </p>
      </div>

      {demo && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          <strong>Demo mode.</strong> No ESPN league is configured, so you&apos;re looking at
          fixture data. Head to <Link href="/setup" className="underline">Setup</Link> to connect
          your real league.
        </div>
      )}

      {error && !demo && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          Couldn&apos;t reach ESPN: {error}. Check <Link href="/setup" className="underline">Setup</Link>.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-600 hover:bg-slate-900 transition-colors"
          >
            <div className="text-2xl mb-2">{c.emoji}</div>
            <div className="font-semibold text-slate-100">{c.title}</div>
            <div className="text-sm text-slate-400 mt-1">{c.body}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
        <div className="font-semibold text-slate-200 mb-2">Suggested order of operations</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            <Link href="/setup" className="text-slate-200 underline">Setup</Link> — connect your ESPN league (or stay in demo mode).
          </li>
          <li>
            <Link href="/cheat-sheet" className="text-slate-200 underline">Cheat Sheet</Link> — import a rankings CSV and adjust tiers.
          </li>
          <li>
            <Link href="/draft" className="text-slate-200 underline">Live Draft</Link> — keep this open during your actual draft.
          </li>
          <li>
            <Link href="/analysis" className="text-slate-200 underline">My Team</Link> — review your roster once the draft ends.
          </li>
        </ol>
      </div>
    </div>
  );
}
