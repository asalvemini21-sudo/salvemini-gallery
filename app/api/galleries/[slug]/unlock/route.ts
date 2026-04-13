import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { password } = await req.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password mancante" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("password_hash")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!gallery) {
    return NextResponse.json({ error: "Non trovata" }, { status: 404 });
  }

  if (!gallery.password_hash) {
    return NextResponse.json({ ok: true });
  }

  const hash = createHash("sha256").update(password).digest("hex");
  if (hash !== gallery.password_hash) {
    return NextResponse.json({ error: "Password errata" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
