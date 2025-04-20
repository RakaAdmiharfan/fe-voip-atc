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
    // Cek apakah username sudah dipakai
    const [existing]: any = await db.execute(
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
    const [result]: any = await db.execute(
      `INSERT INTO users (username, email, password_hash, sip_password) VALUES (?, ?, ?, ?)`,
      [username, email || null, password_hash, sip_password]
    );

    // Ambil ID auto-increment sebagai SIP ID
    const sipId = result.insertId.toString();

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
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Error during registration", error: error.message },
      { status: 500 }
    );
  }
}
