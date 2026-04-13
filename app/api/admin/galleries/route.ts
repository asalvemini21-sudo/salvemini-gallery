import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const { couple_name, slug, wedding_date, password, cover_image_url } = await req.json();

  if (!couple_name || !slug || !wedding_date) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const password_hash = password
    ? createHash("sha256").update(password).digest("hex")
    : null;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("galleries")
    .insert({ couple_name, slug, wedding_date, password_hash, cover_image_url: cover_image_url ?? null })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
