import Image from "next/image";
import Link from "next/link";

// TODO: replace with Supabase query once migration is applied
const EXAMPLE_GALLERY = {
  slug: "elena-marco",
  couple_name: "Elena & Marco",
  wedding_date: "14 Giugno 2025",
  cover_image_url:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80",
  password_hash: null,
  is_published: true,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;

  // Fallback to example data until DB is ready
  const gallery = slug === EXAMPLE_GALLERY.slug ? EXAMPLE_GALLERY : null;

  if (!gallery) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-sm tracking-[0.3em] uppercase opacity-40">
          Galleria non trovata
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Cover image */}
      <Image
        src={gallery.cover_image_url}
        alt={gallery.couple_name}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradient overlay — light at top, darker at bottom */}
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
          {gallery.wedding_date}
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
