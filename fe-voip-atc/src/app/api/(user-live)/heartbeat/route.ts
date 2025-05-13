import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getSessionUser } from "@/lib/auth"; // sesuaikan dengan sistem autentikasimu

export async function POST() {
  const user = await getSessionUser(); // ganti dengan cara ambil ID user kamu

  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Set presence di Redis dengan TTL 60 detik
    await redis.setex(`presence:${user.id}`, 60, "online");
    return NextResponse.json({ message: "Heartbeat received" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
