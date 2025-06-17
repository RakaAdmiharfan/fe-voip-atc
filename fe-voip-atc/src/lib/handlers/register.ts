import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { createRedis } from "@/lib/redis";

export async function handleRegister(req: Request) {
  const redis = createRedis();
  const body = await req.json();
  const username = body.username?.trim();
  const password = body.password;
  const email = body.email?.trim();

  if (!username || !password || !email) {
    return NextResponse.json(
      { message: "Username, email, and password required" },
      { status: 400 }
    );
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
      [username, password_hash, email]
    );

    const userId = (result as any).insertId;

    const token = signJwt({ id: userId, username });

    const response = NextResponse.json({
      message: "User registered successfully",
      sipId: userId,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    await redis.set(`presence:sip:${userId}`, "online", "EX", 75);

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Error during registration", error: error.message },
      { status: 500 }
    );
  }
}
