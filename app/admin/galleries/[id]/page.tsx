import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import GalleryEditor from "./GalleryEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditGalleryPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  const { data: sections } = await supabase
    .from("sections")
    .select("*, photos(*)")
    .eq("gallery_id", id)
    .order("order");

  const normalizedSections = (sections ?? []).map((s) => ({
    ...s,
    photos: ((s.photos ?? []) as { id: string; url: string; thumbnail_url: string | null; order: number }[]).sort(
      (a, b) => a.order - b.order
    ),
  }));

  return <GalleryEditor gallery={gallery} sections={normalizedSections} />;
}
