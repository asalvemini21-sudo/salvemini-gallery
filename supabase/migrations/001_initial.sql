-- Galleries: one per wedding
create table if not exists galleries (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  couple_name   text not null,
  wedding_date  date not null,
  cover_image_url text,
  password_hash text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Sections: ordered groups within a gallery (e.g. "Cerimonia", "Ricevimento")
create table if not exists sections (
  id          uuid primary key default gen_random_uuid(),
  gallery_id  uuid not null references galleries(id) on delete cascade,
  name        text not null,
  "order"     integer not null default 0
);

create index if not exists sections_gallery_id_idx on sections(gallery_id);

-- Photos: ordered images within a section
create table if not exists photos (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references sections(id) on delete cascade,
  url           text not null,
  thumbnail_url text,
  "order"       integer not null default 0
);

create index if not exists photos_section_id_idx on photos(section_id);

-- Row-level security
alter table galleries enable row level security;
alter table sections  enable row level security;
alter table photos    enable row level security;

-- Published galleries are publicly readable
create policy "Published galleries are public"
  on galleries for select
  using (is_published = true);

-- Sections and photos inherit gallery visibility
create policy "Sections of published galleries are public"
  on sections for select
  using (
    exists (
      select 1 from galleries g
      where g.id = sections.gallery_id and g.is_published = true
    )
  );

create policy "Photos of published galleries are public"
  on photos for select
  using (
    exists (
      select 1 from sections s
      join galleries g on g.id = s.gallery_id
      where s.id = photos.section_id and g.is_published = true
    )
  );
