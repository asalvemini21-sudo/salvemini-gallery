import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { password, ...body } = await request.json();

  if (typeof password === "string" && password.length > 0) {
    body.password_hash = createHash("sha256").update(password).digest("hex");
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("galleries").update(body).eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerClient();
  const { error } = await supabase.from("galleries").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
