import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { PhotoDisplay } from "./PhotoDisplay";

type Props = {
  params: Promise<{ slug: string; photoId: string }>;
  searchParams: Promise<{ section?: string }>;
};

export default async function PhotoPage({ params, searchParams }: Props) {
  const { slug, photoId } = await params;
  const { section: sectionParam } = await searchParams;

  const supabase = createServerClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, slug, couple_name, password_hash, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!gallery) notFound();

  const cookieStore = await cookies();
  if (gallery.password_hash && !cookieStore.has(`gallery_unlocked_${slug}`)) {
    redirect(`/${slug}/gallery`);
  }

  // Fetch the photo and verify it belongs to this gallery via its section
  const { data: photo } = await supabase
    .from("photos")
    .select("id, url, order, section_id, filename")
    .eq("id", photoId)
    .single();

  if (!photo) notFound();

  const { data: section } = await supabase
    .from("sections")
    .select("id, gallery_id, photos(id, order)")
    .eq("id", photo.section_id)
    .eq("gallery_id", gallery.id)
    .single();

  if (!section) notFound();

  const sectionPhotos = (
    section.photos as { id: string; order: number }[]
  ).sort((a, b) => a.order - b.order);

  const currentIndex = sectionPhotos.findIndex((p) => p.id === photoId);
  const prevId = currentIndex > 0 ? sectionPhotos[currentIndex - 1].id : null;
  const nextId =
    currentIndex < sectionPhotos.length - 1
      ? sectionPhotos[currentIndex + 1].id
      : null;

  const sectionId = sectionParam ?? photo.section_id;
  const galleryUrl = `/${slug}/gallery?section=${sectionId}`;
  const photoPageUrl = (id: string) =>
    `/${slug}/gallery/photo/${id}?section=${sectionId}`;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#0d0d0d" }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <Link
          href={galleryUrl}
          className="text-xs tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
        >
          ← Galleria
        </Link>

        <div className="flex items-center gap-2">
          {/* Download */}
          <a
            href={`/api/download?url=${encodeURIComponent(photo.url)}${photo.filename ? `&filename=${encodeURIComponent(photo.filename)}` : ""}`}
            download
            aria-label="Scarica foto"
            className="flex items-center justify-center w-9 h-9 text-white/50 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>

          {/* Close */}
          <Link
            href={galleryUrl}
            aria-label="Chiudi"
            className="flex items-center justify-center w-9 h-9 text-white/50 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Desktop layout: side arrows + photo with vertical padding + counter below */}
      <div className="hidden md:flex items-center justify-center w-full h-full">
        {/* Prev arrow — left side */}
        <div className="flex-shrink-0 w-16 flex justify-center">
          {prevId ? (
            <Link href={photoPageUrl(prevId)} aria-label="Foto precedente" className="flex items-center justify-center w-11 h-11 text-white/40 hover:text-white transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          ) : (
            <div className="w-11 h-11" />
          )}
        </div>

        {/* Photo + counter */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt=""
            draggable={false}
            style={{
              maxWidth: "calc(100vw - 128px)",
              maxHeight: "calc(100vh - 160px)",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <div className="text-white/30 text-xs tracking-widest mt-4">
            {currentIndex + 1} / {sectionPhotos.length}
          </div>
        </div>

        {/* Next arrow — right side */}
        <div className="flex-shrink-0 w-16 flex justify-center">
          {nextId ? (
            <Link href={photoPageUrl(nextId)} aria-label="Foto successiva" className="flex items-center justify-center w-11 h-11 text-white/40 hover:text-white transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div className="w-11 h-11" />
          )}
        </div>
      </div>

      {/* Mobile layout: photo + bottom nav (prev · counter · next) */}
      <div className="flex md:hidden flex-col items-center justify-center w-full h-full">
        <PhotoDisplay src={photo.url} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-xs tracking-widest">
          {prevId ? (
            <Link href={photoPageUrl(prevId)} aria-label="Foto precedente" className="flex items-center justify-center w-8 h-8 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          ) : (
            <div className="w-8 h-8" />
          )}
          <span>{currentIndex + 1} / {sectionPhotos.length}</span>
          {nextId ? (
            <Link href={photoPageUrl(nextId)} aria-label="Foto successiva" className="flex items-center justify-center w-8 h-8 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      </div>
    </div>
  );
}
