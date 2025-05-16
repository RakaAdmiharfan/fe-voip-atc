import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ id: session.id, username: session.username });
}
