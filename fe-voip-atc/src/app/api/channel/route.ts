import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { ChannelRow } from "@/types/db";

interface ChannelWithMembers extends ChannelRow {
  members: number;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await db.query<ChannelWithMembers[]>(
      `
      SELECT 
        c.id, 
        c.name, 
        c.number, 
        c.created_at,
        COUNT(cm_all.user_id) AS members
      FROM channels c
      JOIN channel_members cm_self ON c.id = cm_self.channel_id
      LEFT JOIN channel_members cm_all ON c.id = cm_all.channel_id
      WHERE cm_self.user_id = ?
      GROUP BY c.id
      `,
      [userId]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("API /channel error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
