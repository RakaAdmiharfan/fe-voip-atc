import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Hapus token dengan overwrite
  cookieStore.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
