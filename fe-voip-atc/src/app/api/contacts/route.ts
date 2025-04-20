import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();
  console.log("🧠 Current session:", session); // <--- tambahkan ini

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows]: any = await db.execute(
      `SELECT 
        c.contact_id AS id,
        u.username AS username,
        CAST(c.username AS CHAR) AS sipId,
        c.name AS name
      FROM contacts c
      JOIN users u ON u.id = c.username
      WHERE c.user_id = ?`,
      [session.id]
    );

    console.log("📦 Contacts fetched:", rows); // <--- tambahkan ini juga
    return NextResponse.json(rows);
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
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, name } = body;

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { message: "Username is required" },
      { status: 400 }
    );
  }

  try {
    // Cari user berdasarkan username (string login)
    const [userRows]: any = await db.execute(
      "SELECT id, username FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const sipId = userRows[0].id.toString();
    const displayName = name || userRows[0].username;

    // Cek apakah kontak sudah pernah ditambahkan
    const [existing]: any = await db.execute(
      "SELECT 1 FROM contacts WHERE user_id = ? AND username = ?",
      [session.id, sipId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Contact already exists" },
        { status: 409 }
      );
    }

    // Simpan ke dalam contacts (username = SIP ID)
    await db.execute(
      "INSERT INTO contacts (user_id, username, name) VALUES (?, ?, ?)",
      [session.id, sipId, displayName]
    );

    return NextResponse.json({ message: "Contact added successfully" });
  } catch (err: any) {
    console.error("Add contact error:", err);
    return NextResponse.json(
      { message: "Failed to add contact", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    console.error("Delete contact error:", err);
    return NextResponse.json(
      { message: "Failed to delete contact", error: err.message },
      { status: 500 }
    );
  }
}
