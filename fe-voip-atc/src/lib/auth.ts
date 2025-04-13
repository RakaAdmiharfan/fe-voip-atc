import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";
import { JwtPayload } from "jsonwebtoken";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const session = verifyJwt(token);

  // Pastikan session memiliki tipe object dan field id
  if (session && typeof session === "object" && "id" in session) {
    return session as JwtPayload;
  }

  return null;
}
