import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { UserRow, ContactRow } from "@/types/db";
import type { RowDataPacket } from "mysql2/promise";

interface ContactResponse extends RowDataPacket {
  id: number;
  username: string;
  sipId: string;
  name: string | null;
}

export async function GET() {
  const session = await getSessionUser();
  console.log("🧠 Current session:", session);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [contacts] = await db.execute<ContactResponse[]>(
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

    console.log("📦 Contacts fetched:", contacts);
    return NextResponse.json(contacts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Fetch contact error:", err);
      return NextResponse.json(
        { message: "Failed to fetch contact", error: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Unknown error occurred during fetching contact." },
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
    const [userRows] = await db.execute<UserRow[]>(
      "SELECT id, username FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const sipId = userRows[0].id.toString();
    const displayName = name || userRows[0].username;

    const [existing] = await db.execute<ContactRow[]>(
      "SELECT * FROM contacts WHERE user_id = ? AND username = ?",
      [session.id, sipId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Contact already exists" },
        { status: 409 }
      );
    }

    await db.execute(
      "INSERT INTO contacts (user_id, username, name) VALUES (?, ?, ?)",
      [session.id, sipId, displayName]
    );

    return NextResponse.json({ message: "Contact added successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Add contact error:", err);
      return NextResponse.json(
        { message: "Failed to add contact", error: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Unknown error occurred during adding contact." },
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Delete contact error:", err);
      return NextResponse.json(
        { message: "Failed to delete contact", error: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Unknown error occurred during deleting contact." },
      { status: 500 }
    );
  }
}
