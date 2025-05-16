import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { ChannelMemberRow, ChannelRow } from "@/types/db";

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  const userId = sessionUser?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Channel name is required" },
      { status: 400 }
    );
  }

  // ✅ Cari channel berdasarkan nama unik
  const [channelRows] = await db.query<ChannelRow[]>(
    `SELECT id, is_private FROM channels WHERE name = ?`,
    [name]
  );

  const channel = channelRows[0];

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // ✅ Tolak jika channel bersifat private
  if (channel.is_private) {
    return NextResponse.json(
      { error: "Cannot join private channel directly" },
      { status: 403 }
    );
  }

  // ✅ Cek apakah user sudah join channel
  const [rows] = await db.query<ChannelMemberRow[]>(
    `SELECT id FROM channel_members WHERE channel_id = ? AND user_id = ?`,
    [channel.id, userId]
  );

  if (rows.length > 0) {
    return NextResponse.json({ error: "Already joined" }, { status: 409 });
  }

  // ✅ Masukkan user ke channel_members
  await db.query(
    `INSERT INTO channel_members (channel_id, user_id, joined_at) VALUES (?, ?, NOW())`,
    [channel.id, userId]
  );

  return NextResponse.json(
    { message: "Joined channel successfully", channelId: channel.id },
    { status: 200 }
  );
}
