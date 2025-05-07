import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { CallListRow } from "@/types/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute<CallListRow[]>(
      `
      SELECT 
        call_id, caller_id, receiver_id, start_time, end_time,
        recording_filename, recording_s3_url, status
      FROM call_history
      WHERE (caller_id = ? OR receiver_id = ?) AND status = 'ANSWER'
      ORDER BY start_time DESC
      `,
      [session.id, session.id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error occurred during fetching call list.";

    console.error("Fetch recording error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
