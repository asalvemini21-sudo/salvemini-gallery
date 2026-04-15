export type Database = {
  public: {
    Tables: {
      galleries: {
        Row: {
          id: string;
          slug: string;
          couple_name: string;
          wedding_date: string;
          cover_image_url: string | null;
          password_hash: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          couple_name: string;
          wedding_date: string;
          cover_image_url?: string | null;
          password_hash?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          couple_name?: string;
          wedding_date?: string;
          cover_image_url?: string | null;
          password_hash?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          id: string;
          gallery_id: string;
          name: string;
          order: number;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          name: string;
          order?: number;
        };
        Update: {
          id?: string;
          gallery_id?: string;
          name?: string;
          order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sections_gallery_id_fkey";
            columns: ["gallery_id"];
            isOneToOne: false;
            referencedRelation: "galleries";
            referencedColumns: ["id"];
          }
        ];
      };
      photos: {
        Row: {
          id: string;
          section_id: string;
          url: string;
          thumbnail_url: string | null;
          filename: string | null;
          order: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          url: string;
          thumbnail_url?: string | null;
          filename?: string | null;
          order?: number;
        };
        Update: {
          id?: string;
          section_id?: string;
          url?: string;
          thumbnail_url?: string | null;
          filename?: string | null;
          order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "photos_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
