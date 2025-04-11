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
    // Hash password untuk login web
    const password_hash = await bcrypt.hash(password, 10);

    // Generate SIP password secara random
    const sip_password = crypto.randomBytes(6).toString("hex"); // 12 chars

    // Simpan ke DB
    await db.execute(
      `INSERT INTO users (username, email, password_hash, sip_password) VALUES (?, ?, ?, ?)`,
      [username, email || null, password_hash, sip_password]
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
