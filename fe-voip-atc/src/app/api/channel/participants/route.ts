import { NextResponse } from "next/server";
import { createRedis } from "@/lib/redis";

const redis = createRedis();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ message: "Missing channelId" }, { status: 400 });
  }

  const key = `call:channel:${channelId}:participants`;
  const userIds = await redis.smembers(key);

  return NextResponse.json({ participants: userIds });
}
