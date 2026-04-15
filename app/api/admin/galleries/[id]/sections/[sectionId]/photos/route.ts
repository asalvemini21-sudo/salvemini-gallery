import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const { id: galleryId, sectionId } = await params;

  const formData = await request.formData();
  const files = formData.getAll("photos") as File[];
  const validFiles = files.filter((f) => f.size > 0);

  if (!validFiles.length) {
    return Response.json({ error: "Nessun file" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("photos")
    .select("order")
    .eq("section_id", sectionId)
    .order("order", { ascending: false })
    .limit(1);

  let nextOrder =
    existing?.[0]?.order !== undefined ? existing[0].order + 1 : 0;

  const rows: { url: string; thumbnail_url: string; filename: string; section_id: string; order: number }[] = [];

  for (const file of validFiles) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `galleries/${galleryId}/${sectionId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      })
    );

    const url = `${R2_PUBLIC_URL}/${key}`;
    rows.push({ url, thumbnail_url: url, filename: file.name, section_id: sectionId, order: nextOrder++ });
  }

  const { error } = await supabase.from("photos").insert(rows);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, count: rows.length });
}
