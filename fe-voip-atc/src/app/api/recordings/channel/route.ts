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
          ch.call_id, ch.caller_id, ch.channel, ch.join_time, ch.leave_time,
          ch.recording_filename, ch.recording_s3_url,
          ch.log_activity_filename,
          c.name AS channel_name,
          cs.log_activity_s3_url
        FROM channel_history ch
        LEFT JOIN channels c ON ch.channel = c.number
        LEFT JOIN conference_sessions cs ON ch.log_activity_filename = cs.log_activity_filename
        WHERE ch.caller_id = ?
        ORDER BY ch.join_time DESC
      `,
      [userId]
    );

    const result = rows.map((row) => {
      const duration =
        row.join_time && row.leave_time
          ? Math.floor(
              (new Date(row.leave_time).getTime() -
                new Date(row.join_time).getTime()) /
                1000
            )
          : null;

      return {
        ...row,
        duration_seconds: duration,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error occurred during fetching channel recordings.";

    console.error("Fetch channel recordings error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
