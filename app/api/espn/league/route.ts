import { NextResponse } from "next/server";
import { getLeagueSettings, isDemoMode } from "@/lib/espn";

export async function GET() {
  try {
    const settings = await getLeagueSettings();
    return NextResponse.json({ demoMode: isDemoMode(), settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 502 });
  }
}
