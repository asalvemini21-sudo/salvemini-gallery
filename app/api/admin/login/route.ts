import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: "Password errata" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return Response.json({ ok: true });
}
