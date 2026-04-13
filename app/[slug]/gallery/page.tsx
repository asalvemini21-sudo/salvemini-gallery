import { cookies } from "next/headers";
import { UnlockForm } from "./UnlockForm";
import { GalleryView, type GalleryData } from "./GalleryView";

// ---------------------------------------------------------------------------
// Example data — replace with Supabase query once migration is applied
// ---------------------------------------------------------------------------

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80`;

const p = (id: string) => ({
  url: u(id),
  thumbnail_url: u(id) + "&w=800&h=800",
});

const EXAMPLE_GALLERY: GalleryData & { has_password: boolean } = {
  slug: "elena-marco",
  couple_name: "Elena & Marco",
  wedding_date: "14 Giugno 2025",
  has_password: true,
  sections: [
    {
      id: "preparativi",
      name: "Preparativi",
      photos: [
        { id: "p1", ...p("photo-1594552072238-b8a33785b6cd") }, // wedding dress detail
        { id: "p2", ...p("photo-1519225421980-715cb0215aed") }, // bouquet bianco
        { id: "p3", ...p("photo-1457301353672-324d6d14b471") }, // scarpe sposa
        { id: "p4", ...p("photo-1489424731084-a5d8b219a5bb") }, // trucco sposa
        { id: "p5", ...p("photo-1529636798458-92182e662485") }, // dettagli abito
        { id: "p6", ...p("photo-1460978812857-470ed1c77af0") }, // ritratto sposa
        { id: "p7", ...p("photo-1537633552985-df8429e8048b") }, // sposa allo specchio
        { id: "p8", ...p("photo-1583939003579-730e3918a45a") }, // anelli e fiori
      ],
    },
    {
      id: "cerimonia",
      name: "Cerimonia",
      photos: [
        { id: "c1", ...p("photo-1519741497674-611481863552") }, // cerimonia interni
        { id: "c2", ...p("photo-1469371670807-013ccf25f16a") }, // cerimonia esterni
        { id: "c3", ...p("photo-1511285560929-80b456fea0bc") }, // scambio anelli
        { id: "c4", ...p("photo-1606800052052-a08af7148866") }, // bacio
        { id: "c5", ...p("photo-1504674900247-0877df9cc836") }, // lancio petali
        { id: "c6", ...p("photo-1551218808-94e220e084d2") }, // ospiti
        { id: "c7", ...p("photo-1530062845289-9109b2c9c868") }, // sposi che escono
        { id: "c8", ...p("photo-1505236858219-8359eb29e329") }, // momento emozionante
      ],
    },
    {
      id: "ritratti",
      name: "Ritratti",
      photos: [
        { id: "rt1", ...p("photo-1606800052052-a08af7148866") }, // ritratto coppia
        { id: "rt2", ...p("photo-1492684223066-81342ee5ff30") }, // outdoor romantico
        { id: "rt3", ...p("photo-1460978812857-470ed1c77af0") }, // sposa sola
        { id: "rt4", ...p("photo-1537633552985-df8429e8048b") }, // dettaglio abito
        { id: "rt5", ...p("photo-1469371670807-013ccf25f16a") }, // coppia nel verde
        { id: "rt6", ...p("photo-1519741497674-611481863552") }, // golden hour
      ],
    },
    {
      id: "ricevimento",
      name: "Ricevimento",
      photos: [
        { id: "r1", ...p("photo-1558618666-fcd25c85cd64") }, // primo ballo
        { id: "r2", ...p("photo-1481391243133-f96216dcb5d2") }, // coppia che balla
        { id: "r3", ...p("photo-1550005809-91ad75fb315f") }, // taglio torta
        { id: "r4", ...p("photo-1519225421980-715cb0215aed") }, // tavoli allestiti
        { id: "r5", ...p("photo-1583939003579-730e3918a45a") }, // centrotavola
        { id: "r6", ...p("photo-1511285560929-80b456fea0bc") }, // ospiti che ballano
        { id: "r7", ...p("photo-1530062845289-9109b2c9c868") }, // brindisi
        { id: "r8", ...p("photo-1505236858219-8359eb29e329") }, // fuochi/sparklers
      ],
    },
  ],
};

// ---------------------------------------------------------------------------

type Props = { params: Promise<{ slug: string }> };

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;

  // TODO: fetch gallery from Supabase by slug
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

  // Check auth cookie
  const cookieStore = await cookies();
  const isUnlocked = cookieStore.has(`gallery_unlocked_${slug}`);

  if (gallery.has_password && !isUnlocked) {
    return (
      <UnlockForm slug={slug} coupleName={gallery.couple_name} />
    );
  }

  return <GalleryView gallery={gallery} />;
}
