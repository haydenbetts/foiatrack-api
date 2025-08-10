import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.NEXTAUTH_JWT_SECRET || "dev");
export async function requireAuth(bearer?: string) {
  if (!bearer?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = bearer.slice(7);
  const { payload } = await jwtVerify(token, secret);
  const email = payload.email as string | undefined;
  if (!email) throw new Error("Unauthorized");
  return { email };
}
