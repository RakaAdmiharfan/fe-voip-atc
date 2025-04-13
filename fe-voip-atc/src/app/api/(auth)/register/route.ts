import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

// POST /api/register
export async function POST(req: Request) {
  const body = await req.json();
  const { username, password, email } = body;

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password required" },
      { status: 400 }
    );
  }

  try {
    // Hash untuk login web
    const password_hash = await bcrypt.hash(password, 10);

    // SIP password (acak)
    const sip_password = crypto.randomBytes(6).toString("hex");

    // Simpan ke tabel users
    await db.execute(
      `INSERT INTO users (username, email, password_hash, sip_password) VALUES (?, ?, ?, ?)`,
      [username, email || null, password_hash, sip_password]
    );

    // Simpan ke ps_auths
    await db.execute(
      `INSERT INTO ps_auths (id, auth_type, username, password) VALUES (?, 'userpass', ?, ?)`,
      [username, username, sip_password]
    );

    // Simpan ke ps_aors
    await db.execute(`INSERT INTO ps_aors (id, max_contacts) VALUES (?, 1)`, [
      username,
    ]);

    // Simpan ke ps_endpoints
    await db.execute(
      `INSERT INTO ps_endpoints (
        id, transport, aors, auth, context, disallow, allow,
        direct_media, dtmf_mode, rewrite_contact, rtp_symmetric, force_rport
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        "transport-wss", // atau transport name yang kamu pakai di pjsip.conf
        username,
        username,
        "public", // context dari extensions.conf
        "all",
        "opus,ulaw", // codec dari WebRTC
        "no",
        "auto",
        "yes",
        "yes",
        "yes",
      ]
    );

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Error during registration", error: error.message },
      { status: 500 }
    );
  }
}
