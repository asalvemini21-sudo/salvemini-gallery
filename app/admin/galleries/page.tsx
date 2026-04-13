import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function GalleriesPage() {
  const supabase = createServerClient();
  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, slug, couple_name, wedding_date, is_published")
    .order("wedding_date", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light tracking-widest">Gallerie</h1>
        <Link
          href="/admin/galleries/new"
          className="text-sm tracking-[0.2em] uppercase border border-current px-6 py-2 hover:opacity-60 transition-opacity"
        >
          Nuova galleria
        </Link>
      </div>

      {!galleries?.length && (
        <p className="text-sm tracking-widest uppercase opacity-50">
          Nessuna galleria ancora.
        </p>
      )}

      <ul className="divide-y divide-[#d0d4c8]">
        {galleries?.map((g) => (
          <li key={g.id} className="py-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-light tracking-widest">{g.couple_name}</p>
              <p className="text-sm opacity-50 mt-1">
                {new Date(g.wedding_date).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                <span className="font-mono">{g.slug}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-xs tracking-widest uppercase"
                style={{ color: g.is_published ? "#4a7a4a" : "#6b6b60" }}
              >
                {g.is_published ? "Pubblicata" : "Bozza"}
              </span>
              <Link
                href={`/admin/galleries/${g.id}`}
                className="text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                Modifica
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
