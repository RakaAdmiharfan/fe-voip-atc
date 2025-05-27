/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { OkPacket } from "mysql2/promise";
import type { ChannelRow } from "@/types/db";

export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = await context.params; // ✅ wajib di-await di Next.js 15+
    const channelId = parseInt(id);

    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Invalid channel ID" },
        { status: 400 }
      );
    }

    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    const isPrivate = type === "private" ? 1 : 0;

    // Cek apakah channel ada dan user adalah creator
    const [rows] = await db.query<ChannelRow[]>(
      `SELECT id, name, creator_id FROM channels WHERE id = ?`,
      [channelId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = rows[0];
    if (channel.creator_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: not your channel" },
        { status: 403 }
      );
    }

    // Cek nama channel tidak duplikat
    const [exists] = await db.query<ChannelRow[]>(
      `SELECT id FROM channels WHERE name = ? AND id != ?`,
      [name, channelId]
    );

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Channel name already exists" },
        { status: 409 }
      );
    }

    // Update channel
    await db.query<OkPacket>(
      `UPDATE channels SET name = ?, is_private = ? WHERE id = ?`,
      [name, isPrivate, channelId]
    );

    return NextResponse.json({ message: "Channel updated" }, { status: 200 });
  } catch (error) {
    console.error("API /channel/[id] PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const channelId = parseInt(id);

    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Invalid channel ID" },
        { status: 400 }
      );
    }

    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cek apakah channel ada dan user adalah creator
    const [rows] = await db.query<ChannelRow[]>(
      `SELECT id, creator_id FROM channels WHERE id = ?`,
      [channelId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = rows[0];
    if (channel.creator_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: not your channel" },
        { status: 403 }
      );
    }

    // Hapus channel_members dulu untuk foreign key constraint (jika ada)
    await db.query(`DELETE FROM channel_members WHERE channel_id = ?`, [
      channelId,
    ]);

    // Hapus channel
    await db.query(`DELETE FROM channels WHERE id = ?`, [channelId]);

    return NextResponse.json({ message: "Channel deleted" }, { status: 200 });
  } catch (error) {
    console.error("API /channel/[id] DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
