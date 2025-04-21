// lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function signJwt(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    console.error("JWT verification failed:", e);
    return null;
  }
}
