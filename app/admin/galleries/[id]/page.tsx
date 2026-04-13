import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/admin/galleries"
          className="text-sm opacity-40 hover:opacity-100 transition-opacity"
        >
          ← Gallerie
        </Link>
      </div>

      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-light tracking-widest">{gallery.couple_name}</h1>
          <p className="text-sm opacity-50 mt-1">
            {new Date(gallery.wedding_date).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            <span className="font-mono">{gallery.slug}</span>
          </p>
        </div>
        <span
          className="text-xs tracking-widest uppercase mt-2"
          style={{ color: gallery.is_published ? "#4a7a4a" : "#6b6b60" }}
        >
          {gallery.is_published ? "Pubblicata" : "Bozza"}
        </span>
      </div>

      {/* Sections */}
      <h2 className="text-2xl font-light tracking-widest mb-6">Sezioni</h2>

      {!sections?.length && (
        <p className="text-sm tracking-widest uppercase opacity-50 mb-6">
          Nessuna sezione ancora.
        </p>
      )}

      <ul className="flex flex-col gap-8 mb-10">
        {sections?.map((section) => (
          <li key={section.id} className="border border-[#d0d4c8] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-light tracking-widest">{section.name}</h3>
              <span className="text-xs opacity-40">
                {section.photos?.length ?? 0} foto
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {section.photos?.slice(0, 12).map((photo: { id: string; thumbnail_url: string | null; url: string }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.thumbnail_url ?? photo.url}
                  alt=""
                  className="aspect-square object-cover w-full"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-4">
        <Link
          href={`/${gallery.slug}`}
          target="_blank"
          className="text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
        >
          Anteprima →
        </Link>
      </div>
    </div>
  );
}
