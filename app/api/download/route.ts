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

  const filenameParam = request.nextUrl.searchParams.get("filename");
  const filename = filenameParam ?? parsed.pathname.split("/").pop() ?? "foto.jpg";
  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
