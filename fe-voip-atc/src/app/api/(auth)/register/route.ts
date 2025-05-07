import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { ResultSetHeader } from "mysql2/promise";
import type { UserRow } from "@/types/db";

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
    // Cek apakah username sudah dipakai
    const [existing] = await db.execute<UserRow[]>(
      `SELECT 1 FROM users WHERE username = ?`,
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash password untuk login web
    const password_hash = await bcrypt.hash(password, 10);

    // SIP password acak (untuk login SIP.js)
    const sip_password = crypto.randomBytes(6).toString("hex");

    // Simpan ke tabel users
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO users (username, email, password_hash, sip_password) VALUES (?, ?, ?, ?)`,
      [username, email || null, password_hash, sip_password]
    );

    // Ambil ID auto-increment sebagai SIP ID
    const sipId = result.insertId.toString();

    // ✅ Insert default settings ke user_settings
    await db.execute(
      `INSERT INTO user_settings 
   (user_id, input_device_id, output_device_id, input_volume, output_volume, ptt_key) 
   VALUES (?, NULL, NULL, 50, 50, 'Control')`,
      [sipId]
    );

    // Simpan ke ps_auths
    await db.execute(
      `INSERT INTO ps_auths (id, auth_type, username, password) VALUES (?, 'userpass', ?, ?)`,
      [sipId, sipId, sip_password]
    );

    // Simpan ke ps_aors
    await db.execute(`INSERT INTO ps_aors (id, max_contacts) VALUES (?, 1)`, [
      sipId,
    ]);

    // Simpan ke ps_endpoints
    console.log(">> inserting ps_endpoints with id:", sipId);

    await db.execute(
      `INSERT INTO ps_endpoints (
        id, transport, aors, auth, context, disallow, allow,
        direct_media, dtmf_mode, rewrite_contact, rtp_symmetric, force_rport,
        use_avpf, media_encryption, ice_support, dtls_verify, dtls_setup,
        media_use_received_transport, rtcp_mux, webrtc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sipId,
        "transport-wss", // ✅ sesuaikan dengan pjsip.conf kamu
        sipId,
        sipId,
        "public", // ✅ sesuaikan dengan context extensions.conf
        "all",
        "opus,ulaw", // ✅ codec WebRTC
        "no",
        "auto",
        "yes",
        "yes",
        "yes",
        "yes",
        "dtls",
        "yes",
        "yes",
        "actpass",
        "yes",
        "yes",
        "yes", // ✅ nilai untuk kolom `webrtc`
      ]
    );

    console.log("✅ ps_endpoints inserted");

    // Sukses
    return NextResponse.json({
      message: "User registered successfully",
      sipId, // bisa digunakan di frontend untuk call
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Register error:", error);
      return NextResponse.json(
        { message: "Error during registration", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error during registration" },
      { status: 500 }
    );
  }
}
