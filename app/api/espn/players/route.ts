import { NextResponse } from "next/server";
import { getPlayerUniverse } from "@/lib/espn";

export async function GET() {
  try {
    const players = await getPlayerUniverse();
    return NextResponse.json({ players });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 502 });
  }
}
