import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
// import { cookies } from "next/headers";
import type { UserRow } from "@/types/db";
import { createRedis } from "@/lib/redis";

export async function POST(req: Request) {
  const redis = createRedis();
  const body = await req.json();
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password required" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.execute<UserRow[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = signJwt({ id: user.id, username: user.username });

    // ✅ Gunakan NextResponse untuk set cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      sipConfig: {
        username: user.id.toString(),
        password: user.sip_password,
        domain: "sip.pttalk.id",
        wss: "wss://sip.pttalk.id:8089/ws",
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      // maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });

    await redis.set(`presence:sip:${user.id}`, "online", "EX", 75);

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Login error:", error);
      return NextResponse.json(
        { message: "Error during login", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error during login" },
      { status: 500 }
    );
  }
}
