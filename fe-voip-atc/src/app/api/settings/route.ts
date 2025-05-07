import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { UserSettingsRow } from "@/types/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute<UserSettingsRow[]>(
      `SELECT * FROM user_settings WHERE user_id = ? LIMIT 1`,
      [session.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(null); // default value on frontend
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Settings fetch error:", err);
    return NextResponse.json(
      { message: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      input_device_id,
      output_device_id,
      input_volume,
      output_volume,
      ptt_key,
    } = await req.json();

    await db.execute(
      `
      INSERT INTO user_settings (user_id, input_device_id, output_device_id, input_volume, output_volume, ptt_key)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        input_device_id = VALUES(input_device_id),
        output_device_id = VALUES(output_device_id),
        input_volume = VALUES(input_volume),
        output_volume = VALUES(output_volume),
        ptt_key = VALUES(ptt_key)
      `,
      [
        session.id,
        input_device_id,
        output_device_id,
        input_volume,
        output_volume,
        ptt_key,
      ]
    );

    return NextResponse.json({ message: "Settings saved successfully." });
  } catch (err) {
    console.error("Settings save error:", err);
    return NextResponse.json(
      { message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
