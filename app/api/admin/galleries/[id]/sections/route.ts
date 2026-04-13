import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gallery_id } = await params;
  const { name } = await request.json();

  if (!name?.trim()) {
    return Response.json({ error: "Nome sezione mancante" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("sections")
    .select("order")
    .eq("gallery_id", gallery_id)
    .order("order", { ascending: false })
    .limit(1);

  const order =
    existing?.[0]?.order !== undefined ? existing[0].order + 1 : 0;

  const { data, error } = await supabase
    .from("sections")
    .insert({ gallery_id, name: name.trim(), order })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id: data.id });
}
