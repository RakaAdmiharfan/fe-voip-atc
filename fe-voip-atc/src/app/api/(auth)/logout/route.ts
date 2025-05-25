import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { createRedis } from "@/lib/redis";

export async function POST() {
  const redis = createRedis();
  const user = await getSessionUser();

  if (user?.id) {
    const key = `presence:sip:${user.id}`;
    await redis.del(key);
    console.log(`🔴 Logout - presence removed for user ${user.id}`);
  }
  const cookieStore = await cookies();

  // Hapus token dengan overwrite
  cookieStore.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
