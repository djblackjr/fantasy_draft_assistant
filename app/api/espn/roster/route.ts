import { NextRequest, NextResponse } from "next/server";
import { getRoster, myTeamId } from "@/lib/espn";

export async function GET(req: NextRequest) {
  const teamIdParam = req.nextUrl.searchParams.get("teamId");
  const teamId = teamIdParam ? Number(teamIdParam) : myTeamId();
  if (!teamId) {
    return NextResponse.json(
      { error: "No teamId provided and ESPN_TEAM_ID is not set" },
      { status: 400 }
    );
  }
  try {
    const roster = await getRoster(teamId);
    return NextResponse.json({ teamId, roster });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 502 });
  }
}
