import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await params;
  const supabase = createServerClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("url")
    .eq("id", photoId)
    .single();

  if (!photo) {
    return Response.json({ error: "Foto non trovata" }, { status: 404 });
  }

  const { error } = await supabase.from("photos").delete().eq("id", photoId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Delete from R2 (best effort — don't fail if missing)
  try {
    const key = photo.url.replace(`${R2_PUBLIC_URL}/`, "");
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    // non-fatal
  }

  return Response.json({ ok: true });
}
