"use client";

import { useEffect, useState } from "react";
import type { LeagueSettings } from "@/lib/types";

interface LeagueResponse {
  demoMode: boolean;
  settings: LeagueSettings;
}

export default function SetupPage() {
  const [data, setData] = useState<LeagueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function testConnection() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/espn/league", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Setup</h1>
        <p className="text-slate-400 mt-1">
          Connection settings live in a local <code className="text-slate-300">.env.local</code>{" "}
          file (never committed to git) — this page just tests the connection.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-slate-100">Connection status</div>
          <button
            onClick={testConnection}
            className="text-sm px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            {loading ? "Checking…" : "Re-test"}
          </button>
        </div>

        <div className="mt-4 text-sm">
          {loading && <div className="text-slate-400">Contacting ESPN…</div>}
          {error && (
            <div className="text-red-300">
              <div className="font-medium">Connection failed</div>
              <div className="text-red-300/80 mt-1">{error}</div>
            </div>
          )}
          {data && !error && (
            <div className="space-y-1 text-slate-300">
              <div>
                Mode:{" "}
                <span className={data.demoMode ? "text-amber-300" : "text-emerald-300"}>
                  {data.demoMode ? "Demo (fixture data)" : "Live ESPN league"}
                </span>
              </div>
              <div>League: {data.settings.name}</div>
              <div>Season: {data.settings.season}</div>
              <div>Teams: {data.settings.teamCount}</div>
              <div>My team ID: {data.settings.myTeamId ?? "not set"}</div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400 space-y-4">
        <div className="font-semibold text-slate-200">Connecting your real league</div>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Copy <code className="text-slate-300">.env.example</code> to{" "}
            <code className="text-slate-300">.env.local</code> in the project root.
          </li>
          <li>
            Set <code className="text-slate-300">ESPN_LEAGUE_ID</code>,{" "}
            <code className="text-slate-300">ESPN_SEASON</code>, and{" "}
            <code className="text-slate-300">ESPN_TEAM_ID</code> from your league&apos;s URL
            (e.g. <code className="text-slate-300">.../team?leagueId=123456&amp;teamId=3</code>).
          </li>
          <li>
            If your league is <strong>private</strong>, also set{" "}
            <code className="text-slate-300">ESPN_S2</code> and{" "}
            <code className="text-slate-300">ESPN_SWID</code> — grab both from your browser&apos;s
            cookies for fantasy.espn.com while logged in (DevTools → Application/Storage →
            Cookies). Public leagues can leave these blank.
          </li>
          <li>
            Restart the dev server (<code className="text-slate-300">npm run dev</code>) so the
            new environment variables load, then click Re-test above.
          </li>
        </ol>
        <p>
          Leave <code className="text-slate-300">ESPN_LEAGUE_ID</code> unset to stay in demo mode
          with fixture data — handy for trying the app out first.
        </p>
      </div>
    </div>
  );
}
