"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

export async function unlockGallery(
  slug: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get("password");

  if (!password || typeof password !== "string") {
    return { error: "Inserisci la password." };
  }

  const supabase = createServerClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("password_hash")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!gallery) {
    return { error: "Galleria non trovata." };
  }

  if (gallery.password_hash) {
    const hash = createHash("sha256").update(password).digest("hex");
    if (hash !== gallery.password_hash) {
      return { error: "Password errata. Riprova." };
    }
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
