import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
