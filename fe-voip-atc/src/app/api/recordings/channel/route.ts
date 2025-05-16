import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { ChannelHistoryRow } from "@/types/db";

export async function GET() {
  const session = await getSessionUser();
  const userId = session?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.query<ChannelHistoryRow[]>(
      `
      SELECT 
        call_id, caller_id, channel, join_time, leave_time,
        recording_filename, recording_s3_url,
        log_speech_filename, log_speech_s3_url
      FROM channel_history
      WHERE caller_id = ?
      ORDER BY join_time DESC
      `,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error occurred during fetching channel recordings.";

    console.error("Fetch channel recordings error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
