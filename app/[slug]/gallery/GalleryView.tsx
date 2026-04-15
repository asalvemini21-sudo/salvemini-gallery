import Image from "next/image";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
};

type Section = {
  id: string;
  name: string;
  photos: Photo[];
};

export type GalleryData = {
  slug: string;
  couple_name: string;
  wedding_date: string;
  sections: Section[];
};

/** Distributes photos round-robin across N columns to preserve left-to-right reading order. */
function splitColumns(photos: Photo[], n: number): Photo[][] {
  const cols: Photo[][] = Array.from({ length: n }, () => []);
  photos.forEach((photo, i) => cols[i % n].push(photo));
  return cols;
}

export function GalleryView({
  gallery,
  activeSectionId,
}: {
  gallery: GalleryData;
  activeSectionId: string;
}) {
  const activeSection =
    gallery.sections.find((s) => s.id === activeSectionId) ?? gallery.sections[0];
  const photos = activeSection?.photos ?? [];
  const photoPageUrl = (photoId: string) =>
    `/${gallery.slug}/gallery/photo/${photoId}?section=${activeSectionId}`;

  const downloadUrl = (photo: Photo) =>
    `/api/download?url=${encodeURIComponent(photo.url)}${photo.filename ? `&filename=${encodeURIComponent(photo.filename)}` : ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-20 border-b border-[#d0d4c8]"
        style={{ background: "rgba(233,237,225,0.98)" }}
      >
        <div className="max-w-7xl mx-auto px-5 pt-4 flex items-center">
          <Link
            href={`/${gallery.slug}`}
            className="text-xs tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity w-20 shrink-0"
          >
            ← Copertina
          </Link>
          <div className="flex-1 text-center">
            <p className="text-xs tracking-[0.3em] uppercase opacity-50 mb-0.5">
              {gallery.wedding_date}
            </p>
            <h1 className="text-xl md:text-2xl font-light tracking-widest leading-none">
              {gallery.couple_name}
            </h1>
          </div>
          <div className="w-20 shrink-0" />
        </div>

        {/* Section tabs — native <a> links, no JS */}
        <nav className="max-w-7xl mx-auto px-5 flex gap-7 overflow-x-auto mt-4">
          {gallery.sections.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <a
                key={section.id}
                href={`/${gallery.slug}/gallery?section=${section.id}`}
                className={[
                  "pb-3 text-xs tracking-[0.3em] uppercase whitespace-nowrap border-b-[1.5px] transition-colors duration-150 flex-shrink-0",
                  isActive
                    ? "border-[#1a1a18] opacity-100"
                    : "border-transparent opacity-35",
                ].join(" ")}
              >
                {section.name}
                <span className="ml-2 opacity-50">({section.photos.length})</span>
              </a>
            );
          })}
        </nav>
      </header>

      {/* Photo grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 py-3">
        {/* Mobile: single column */}
        <div className="flex flex-col gap-1.5 md:hidden">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={photoPageUrl(photo.id)}
            >
              <Image
                src={photo.thumbnail_url ?? photo.url}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto block"
              />
            </a>
          ))}
        </div>

        {/* Tablet: 2 columns */}
        <div className="hidden md:flex lg:hidden gap-1.5">
          {splitColumns(photos, 2).map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-1.5">
              {col.map((photo) => (
                <div key={photo.id} className="relative group">
                  <a href={photoPageUrl(photo.id)}>
                    <Image
                      src={photo.thumbnail_url ?? photo.url}
                      alt=""
                      width={0}
                      height={0}
                      sizes="50vw"
                      className="w-full h-auto block max-h-[500px] object-cover"
                    />
                  </a>
                  <a
                    href={downloadUrl(photo)}
                    download
                    aria-label="Scarica foto"
                    className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden lg:flex gap-1.5">
          {splitColumns(photos, 3).map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-1.5">
              {col.map((photo) => (
                <div key={photo.id} className="relative group">
                  <a href={photoPageUrl(photo.id)}>
                    <Image
                      src={photo.thumbnail_url ?? photo.url}
                      alt=""
                      width={0}
                      height={0}
                      sizes="33vw"
                      className="w-full h-auto block max-h-[500px] object-cover"
                    />
                  </a>
                  <a
                    href={downloadUrl(photo)}
                    download
                    aria-label="Scarica foto"
                    className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
