import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

interface MaxSuffixRow extends RowDataPacket {
  max_suffix: number | null;
}

interface ChannelRow extends RowDataPacket {
  id: number;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
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

    // ✅ Cek apakah nama sudah dipakai
    const [existing] = await db.query<ChannelRow[]>(
      `SELECT id FROM channels WHERE name = ?`,
      [name]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Channel name already exists" },
        { status: 409 }
      );
    }

    // ✅ Hitung nomor channel berikutnya (format: 6001, 6002, ...)
    const [rows] = await db.query<MaxSuffixRow[]>(
      `SELECT MAX(CAST(SUBSTRING(number, 2) AS UNSIGNED)) AS max_suffix
       FROM channels
       WHERE number LIKE '6%'`
    );

    const nextSuffix = (rows[0].max_suffix || 0) + 1;
    const number = `6${String(nextSuffix).padStart(3, "0")}`;

    // ✅ Insert ke tabel channels
    const [insertResult] = await db.query<OkPacket>(
      `INSERT INTO channels (name, number, created_at) VALUES (?, ?, NOW())`,
      [name, number]
    );

    const channelId = insertResult.insertId;

    // ✅ Auto join user sebagai anggota channel
    await db.query(
      `INSERT INTO channel_members (channel_id, user_id, joined_at) VALUES (?, ?, NOW())`,
      [channelId, userId]
    );

    return NextResponse.json(
      { message: "Channel created", channelId, number },
      { status: 201 }
    );
  } catch (error) {
    console.error("API /channel/create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
