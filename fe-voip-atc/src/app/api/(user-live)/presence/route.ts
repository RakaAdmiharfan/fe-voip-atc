import { createRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const redis = createRedis();
  const { searchParams } = new URL(req.url);
  const sipIds = searchParams.getAll("sipId");

  if (sipIds.length === 0) {
    return NextResponse.json({ message: "Missing sipId" }, { status: 400 });
  }

  const results = await Promise.all(
    sipIds.map(async (id) => {
      const key = `presence:sip:${id}`;
      const status = await redis.get(key);
      const ttl = await redis.ttl(key);

      return {
        sipId: id,
        isOnline: status === "online",
        ttl, // TTL in seconds
      };
    })
  );

  return NextResponse.json(results);
}
