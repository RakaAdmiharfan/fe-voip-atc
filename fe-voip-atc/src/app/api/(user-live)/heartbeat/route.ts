import { NextResponse } from "next/server";
import { createRedis } from "@/lib/redis";
import { getSessionUser } from "@/lib/auth"; // sesuaikan dengan sistem autentikasimu

export async function POST() {
  const redis = createRedis();
  const user = await getSessionUser();

  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const key = `presence:sip:${user.id}`;
    await redis.setex(key, 75, "online");

    console.log(`[HEARTBEAT] Refresh presence for user ${user.id}`);
    return NextResponse.json({ message: "Heartbeat received" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
