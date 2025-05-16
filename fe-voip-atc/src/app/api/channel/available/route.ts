import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { ChannelRow } from "@/types/db";

export async function GET() {
  const user = await getSessionUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows] = await db.query<ChannelRow[]>(
    `
    SELECT c.id, c.name, c.number, c.created_at, c.is_private
    FROM channels c
    WHERE c.is_private = 0
    AND c.id NOT IN (
      SELECT channel_id FROM channel_members WHERE user_id = ?
    )
    `,
    [userId]
  );

  return NextResponse.json(rows, { status: 200 });
}
