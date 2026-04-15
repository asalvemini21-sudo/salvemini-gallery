import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAME = "pub-bebb81dbae7d4512aa92c717a395c19d.r2.dev";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Parametro url mancante" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL non valido" }, { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOSTNAME) {
    return NextResponse.json({ error: "Dominio non consentito" }, { status: 403 });
  }

  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: "Impossibile recuperare il file" }, { status: 502 });
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  const filenameParam = request.nextUrl.searchParams.get("filename");
  const filename = filenameParam ?? parsed.pathname.split("/").pop() ?? "foto.jpg";
  const encodedFilename = encodeURIComponent(filename);
  const contentDisposition =
    `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": contentDisposition,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
