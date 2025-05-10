import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sipIds = searchParams.getAll("sipId");

  if (sipIds.length === 0) {
    return NextResponse.json({ message: "Missing sipId" }, { status: 400 });
  }

  const results = await Promise.all(
    sipIds.map(async (id) => {
      const status = await redis.get(`presence:sip:${id}`);
      return { sipId: id, isOnline: status === "online" };
    })
  );

  return NextResponse.json(results);
}
