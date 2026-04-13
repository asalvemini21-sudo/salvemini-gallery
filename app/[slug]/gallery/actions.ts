"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: replace with DB hash lookup per gallery
const EXAMPLE_PASSWORD = "sposi2025";

export async function unlockGallery(
  slug: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get("password");

  if (!password || typeof password !== "string") {
    return { error: "Inserisci la password." };
  }

  // TODO: fetch gallery.password_hash from DB, compare with
  // createHash('sha256').update(password).digest('hex')
  if (password !== EXAMPLE_PASSWORD) {
    return { error: "Password errata. Riprova." };
  }

  const cookieStore = await cookies();
  cookieStore.set(`gallery_unlocked_${slug}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
    path: "/",
  });

  redirect(`/${slug}/gallery`);
}
