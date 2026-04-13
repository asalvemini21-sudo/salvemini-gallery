import type { Database } from "@/lib/supabase/types";

export type Gallery = Database["public"]["Tables"]["galleries"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Photo = Database["public"]["Tables"]["photos"]["Row"];

export type SectionWithPhotos = Section & { photos: Photo[] };
export type GalleryWithSections = Gallery & { sections: SectionWithPhotos[] };
