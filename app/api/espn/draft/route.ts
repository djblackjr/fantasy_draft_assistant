import { NextResponse } from "next/server";
import { getDraftPicks } from "@/lib/espn";

// Polled by the live draft assistant page. no-store keeps every call fresh.
export async function GET() {
  try {
    const picks = await getDraftPicks();
    return NextResponse.json({ picks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 502 });
  }
}
