import { getCurrentUser } from "@/lib/auth/session";

/** Lets the client-side nav show sign-in state without making every page dynamic. */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json(
    user ? { signedIn: true, name: user.name, email: user.email, role: user.role } : { signedIn: false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
