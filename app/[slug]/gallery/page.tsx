import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { UnlockForm } from "./UnlockForm";
import { GalleryView, type GalleryData } from "./GalleryView";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string }>;
};

export default async function GalleryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { section: sectionParam } = await searchParams;

  const supabase = createServerClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, slug, couple_name, wedding_date, password_hash, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!gallery) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-sm tracking-[0.3em] uppercase opacity-40">
          Galleria non trovata
        </p>
      </main>
    );
  }

  const cookieStore = await cookies();
  const isUnlocked = cookieStore.has(`gallery_unlocked_${slug}`);

  if (gallery.password_hash && !isUnlocked) {
    return <UnlockForm slug={slug} coupleName={gallery.couple_name} />;
  }

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name, order, photos(id, url, thumbnail_url, order)")
    .eq("gallery_id", gallery.id)
    .order("order", { ascending: true });

  const normalizedSections = (sections ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    photos: (
      (s.photos as { id: string; url: string; thumbnail_url: string | null; filename: string | null; order: number }[]) ?? []
    )
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ id: p.id, url: p.url, thumbnail_url: p.thumbnail_url, filename: p.filename ?? null })),
  }));

  const activeSectionId =
    normalizedSections.find((s) => s.id === sectionParam)?.id ??
    normalizedSections[0]?.id ??
    "";

  const galleryData: GalleryData = {
    slug: gallery.slug,
    couple_name: gallery.couple_name,
    wedding_date: new Date(gallery.wedding_date).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    sections: normalizedSections,
  };

  return <GalleryView gallery={galleryData} activeSectionId={activeSectionId} />;
}
