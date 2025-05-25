import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { CallListRow } from "@/types/db";

export async function GET() {
  const session = await getSessionUser();
  const userId = session?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute<CallListRow[]>(
      `
      SELECT 
        ch.call_id, ch.caller_id, ch.receiver_id, ch.start_time, ch.end_time,
        ch.recording_filename, ch.recording_s3_url, ch.status,
        u1.username AS caller_username,
        u2.username AS receiver_username
      FROM call_history ch
      JOIN users u1 ON ch.caller_id = u1.id
      JOIN users u2 ON ch.receiver_id = u2.id
      WHERE (ch.caller_id = ? OR ch.receiver_id = ?) AND ch.status = 'ANSWER'
      ORDER BY ch.start_time DESC
      `,
      [userId, userId]
    );

    const result = rows.map((row) => {
      const isCaller = String(row.caller_id) === String(userId);
      return {
        ...row,
        display_name: isCaller ? row.receiver_username : row.caller_username,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Fetch recording error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
