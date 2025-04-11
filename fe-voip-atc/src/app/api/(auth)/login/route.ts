import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

// POST /api/login
export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password required" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // Konfigurasi untuk SIP.js
    const sipConfig = {
      username: user.username,
      password: user.sip_password,
      domain: "108.136.142.174", // ganti sesuai domain Asterisk kamu
      wss: "wss://108.136.142.174:8089/ws", // ganti sesuai WSS Asterisk kamu
    };

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      sipConfig,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Error during login", error: error.message },
      { status: 500 }
    );
  }
}
