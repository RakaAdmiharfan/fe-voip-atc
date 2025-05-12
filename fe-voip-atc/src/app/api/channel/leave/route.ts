import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

interface ChannelRow extends RowDataPacket {
  id: number;
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    // Cek apakah channel ada
    const [channels] = await db.query<ChannelRow[]>(
      `SELECT id FROM channels WHERE name = ?`,
      [name]
    );

    if (channels.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channelId = channels[0].id;

    // Cek apakah user memang join channel
    const [memberships] = await db.query<RowDataPacket[]>(
      `SELECT id FROM channel_members WHERE user_id = ? AND channel_id = ?`,
      [userId, channelId]
    );

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: "You are not in this channel" },
        { status: 409 }
      );
    }

    // Hapus keanggotaan
    await db.query(
      `DELETE FROM channel_members WHERE user_id = ? AND channel_id = ?`,
      [userId, channelId]
    );

    return NextResponse.json(
      { message: "Left channel successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("API /channel/leave error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
