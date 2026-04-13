import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const prefix = (formData.get("prefix") as string) || "uploads";

  if (!file || file.size === 0) {
    return Response.json({ error: "Nessun file" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    })
  );

  return Response.json({ url: `${R2_PUBLIC_URL}/${key}` });
}
