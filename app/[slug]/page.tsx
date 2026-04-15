import Image from "next/image";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;

  const supabase = createServerClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("slug, couple_name, wedding_date, cover_image_url, is_published")
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

  const weddingDate = new Date(gallery.wedding_date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {gallery.cover_image_url ? (
        <Image
          src={gallery.cover_image_url}
          alt={gallery.couple_name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a1a18]" />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6 text-center text-white">
        <p className="text-xs tracking-[0.45em] uppercase mb-5 opacity-80">
          {weddingDate}
        </p>

        <h1
          className="text-6xl md:text-8xl font-light mb-10"
          style={{ letterSpacing: "0.08em" }}
        >
          {gallery.couple_name}
        </h1>

        <Link
          href={`/${slug}/gallery`}
          className="text-xs tracking-[0.35em] uppercase border border-white/70 px-10 py-4 hover:bg-white hover:text-[#1a1a18] transition-colors duration-300"
        >
          Entra nella galleria
        </Link>
      </div>
    </main>
  );
}
