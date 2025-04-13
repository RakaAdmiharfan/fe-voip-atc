import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows]: any = await db.execute(
      "SELECT contact_id AS id, username, name FROM contacts WHERE user_id = ?",
      [session.id]
    );

    return NextResponse.json(rows); // <-- pastikan ini array
  } catch (err: any) {
    console.error("Error fetching contacts:", err);
    return NextResponse.json(
      { message: "Failed to fetch contacts", error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { username, name } = body;

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { message: "Username is required" },
      { status: 400 }
    );
  }

  try {
    // Cek apakah username ada di tabel ps_endpoints atau users
    const [endpointRows]: any = await db.execute(
      "SELECT id FROM ps_endpoints WHERE id = ?",
      [username]
    );

    const [userRows]: any = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (endpointRows.length === 0 && userRows.length === 0) {
      return NextResponse.json(
        { message: "User not found in SIP endpoints or users table" },
        { status: 404 }
      );
    }

    // Simpan ke dalam contacts
    await db.execute(
      "INSERT INTO contacts (user_id, username, name) VALUES (?, ?, ?)",
      [session.id, username, name || null]
    );

    return NextResponse.json({ message: "Contact added successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Failed to add contact", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("id");

  if (!contactId) {
    return NextResponse.json(
      { message: "Contact ID is required" },
      { status: 400 }
    );
  }

  try {
    await db.execute(
      "DELETE FROM contacts WHERE contact_id = ? AND user_id = ?",
      [contactId, session.id]
    );

    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Failed to delete contact", error: err.message },
      { status: 500 }
    );
  }
}
