"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  thumbnail_url: string;
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

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function GalleryView({ gallery }: { gallery: GalleryData }) {
  const [activeId, setActiveId] = useState(gallery.sections[0]?.id ?? "");

  const activeSection =
    gallery.sections.find((s) => s.id === activeId) ?? gallery.sections[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-20 border-b border-[#d0d4c8]"
        style={{ background: "rgba(233,237,225,0.96)", backdropFilter: "blur(8px)" }}
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

          {/* Spacer to keep name centered */}
          <div className="w-20 shrink-0" />
        </div>

        {/* Section tabs */}
        <nav className="max-w-7xl mx-auto px-5 flex gap-7 overflow-x-auto mt-4">
          {gallery.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={[
                "pb-3 text-xs tracking-[0.3em] uppercase whitespace-nowrap border-b-[1.5px] transition-all duration-150",
                activeId === section.id
                  ? "border-[#1a1a18] opacity-100"
                  : "border-transparent opacity-35 hover:opacity-60",
              ].join(" ")}
            >
              {section.name}
              <span className="ml-2 opacity-50">
                ({section.photos.length})
              </span>
            </button>
          ))}
        </nav>
      </header>

      {/* Photo grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 py-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {activeSection?.photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden group">
              <Image
                src={photo.thumbnail_url}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Download button — always visible */}
              <a
                href={photo.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Scarica foto"
                className="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 text-white transition-opacity duration-150 hover:opacity-80"
                style={{ background: "rgba(0,0,0,0.45)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadIcon />
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
