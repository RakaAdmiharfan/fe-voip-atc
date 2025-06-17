import { handleRegister } from "@/lib/handlers/register";

export async function POST(req: Request) {
  return handleRegister(req);
}
