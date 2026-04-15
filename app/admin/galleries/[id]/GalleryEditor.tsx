"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  order: number;
};

type Section = {
  id: string;
  name: string;
  order: number;
  photos: Photo[];
};

type Gallery = {
  id: string;
  slug: string;
  couple_name: string;
  wedding_date: string;
  cover_image_url: string | null;
  password_hash: string | null;
  is_published: boolean;
};

interface Props {
  gallery: Gallery;
  sections: Section[];
}

export default function GalleryEditor({ gallery, sections }: Props) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  type UploadProgress = { current: number; total: number; errors: string[] };
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [coverUploading, setCoverUploading] = useState(false);
  const [deletingGallery, setDeletingGallery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.photos.length > 0]))
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  async function togglePublish() {
    setPublishing(true);
    await fetch(`/api/admin/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !gallery.is_published }),
    });
    setPublishing(false);
    router.refresh();
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setAddingSection(true);
    await fetch(`/api/admin/galleries/${gallery.id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSectionName.trim() }),
    });
    setNewSectionName("");
    setAddingSection(false);
    router.refresh();
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Eliminare questa sezione e tutte le sue foto?")) return;
    await fetch(`/api/admin/galleries/${gallery.id}/sections/${sectionId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function uploadPhotos(sectionId: string, files: FileList) {
    if (!files.length) return;
    const fileArray = Array.from(files);
    const total = fileArray.length;
    const errors: string[] = [];

    setUploadProgress((prev) => ({ ...prev, [sectionId]: { current: 0, total, errors: [] } }));

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const formData = new FormData();
        formData.append("photos", file);
        const res = await fetch(
          `/api/admin/galleries/${gallery.id}/sections/${sectionId}/photos`,
          { method: "POST", body: formData }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          errors.push(`${file.name}: ${body.error ?? res.statusText}`);
        }
      } catch {
        errors.push(`${file.name}: errore di rete`);
      }
      setUploadProgress((prev) => ({
        ...prev,
        [sectionId]: { current: i + 1, total, errors: [...errors] },
      }));
    }

    router.refresh();
    // Keep errors visible, clear progress bar after a moment
    setTimeout(() => {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    }, errors.length ? 0 : 1500);
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Eliminare questa foto?")) return;
    await fetch(`/api/admin/photos/${photoId}`, { method: "DELETE" });
    router.refresh();
  }

  async function uploadCover(file: File) {
    setCoverUploading(true);
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("prefix", "covers");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: uploadForm,
    });
    if (res.ok) {
      const { url } = await res.json();
      await fetch(`/api/admin/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_image_url: url }),
      });
    }
    setCoverUploading(false);
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) return;
    setSavingPassword(true);
    await fetch(`/api/admin/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setNewPassword("");
    setSavingPassword(false);
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  async function deleteGallery() {
    if (!confirm(`Eliminare definitivamente la galleria "${gallery.couple_name}"?`)) return;
    setDeletingGallery(true);
    await fetch(`/api/admin/galleries/${gallery.id}`, { method: "DELETE" });
    router.push("/admin/galleries");
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/admin/galleries"
          className="text-sm opacity-40 hover:opacity-100 transition-opacity"
        >
          ← Gallerie
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light tracking-widest">
            {gallery.couple_name}
          </h1>
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
        <div className="flex items-center gap-3 mt-2 flex-shrink-0">
          <Link
            href={`/${gallery.slug}`}
            target="_blank"
            className="text-sm tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity"
          >
            Anteprima →
          </Link>
          <button
            onClick={togglePublish}
            disabled={publishing}
            className="text-sm tracking-[0.2em] uppercase border px-4 py-2 hover:opacity-60 transition-opacity disabled:opacity-40"
            style={{
              borderColor: gallery.is_published ? "#4a7a4a" : "currentColor",
              color: gallery.is_published ? "#4a7a4a" : "currentColor",
            }}
          >
            {publishing
              ? "…"
              : gallery.is_published
              ? "Pubblicata ✓"
              : "Pubblica"}
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="border border-[#d0d4c8] p-6 mb-8">
        <h2 className="text-xs tracking-[0.2em] uppercase opacity-60 mb-4">
          Foto copertina
        </h2>
        <div className="flex items-center gap-6">
          {gallery.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gallery.cover_image_url}
              alt="Copertina"
              className="w-32 h-20 object-cover"
            />
          ) : (
            <div className="w-32 h-20 border border-dashed border-[#d0d4c8] flex items-center justify-center text-xs opacity-40">
              Nessuna
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCover(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="text-xs tracking-[0.2em] uppercase border border-current px-4 py-2 hover:opacity-60 transition-opacity disabled:opacity-40"
          >
            {coverUploading ? "Upload…" : "Cambia copertina"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="border border-[#d0d4c8] p-6 mb-8">
        <h2 className="text-xs tracking-[0.2em] uppercase opacity-60 mb-4">
          Password accesso
        </h2>
        <form onSubmit={savePassword} className="flex items-end gap-4">
          <div className="flex items-center gap-2 flex-1 border-b border-current">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={gallery.password_hash ? "Nuova password (lascia vuoto per non cambiare)" : "Imposta una password (opzionale)"}
              className="flex-1 bg-transparent py-2 text-base tracking-wide outline-none placeholder:opacity-30 placeholder:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="opacity-30 hover:opacity-80 transition-opacity flex-shrink-0"
              tabIndex={-1}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={savingPassword || !newPassword}
            className="text-xs tracking-[0.2em] uppercase border border-current px-4 py-2 hover:opacity-60 transition-opacity disabled:opacity-40 flex-shrink-0"
          >
            {savingPassword ? "…" : passwordSaved ? "Salvata ✓" : "Salva password"}
          </button>
        </form>
      </div>

      {/* Sections */}
      <h2 className="text-2xl font-light tracking-widest mb-6">Sezioni</h2>

      {!sections.length && (
        <p className="text-sm tracking-widest uppercase opacity-50 mb-6">
          Nessuna sezione. Aggiungine una qui sotto.
        </p>
      )}

      <div className="flex flex-col gap-6 mb-10">
        {sections.map((section) => (
          <div key={section.id} className="border border-[#d0d4c8]">
            {/* Section header — always visible */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs opacity-30 transition-transform duration-200"
                  style={{ display: "inline-block", transform: collapsedSections[section.id] ? "rotate(-90deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
                <h3 className="text-xl font-light tracking-widest">
                  {section.name}
                </h3>
              </div>
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs opacity-40">
                  {section.photos.length} foto
                </span>
                <label
                  className="text-xs tracking-[0.2em] uppercase border border-current px-3 py-1 cursor-pointer hover:opacity-60 transition-opacity"
                  style={{
                    opacity: uploadProgress[section.id] ? 0.4 : undefined,
                    pointerEvents: uploadProgress[section.id] ? "none" : undefined,
                  }}
                >
                  Aggiungi foto
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setCollapsedSections((prev) => ({ ...prev, [section.id]: false }));
                        uploadPhotos(section.id, e.target.files);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-xs opacity-30 hover:opacity-100 transition-opacity"
                >
                  Elimina sezione
                </button>
              </div>
            </div>

            {/* Section body — collapsible */}
            {!collapsedSections[section.id] && (
              <div className="px-6 pb-6">
                {uploadProgress[section.id] && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                      <span>
                        {uploadProgress[section.id].current} di{" "}
                        {uploadProgress[section.id].total} foto caricate
                      </span>
                      {uploadProgress[section.id].current < uploadProgress[section.id].total && (
                        <span>Upload in corso…</span>
                      )}
                    </div>
                    <div className="w-full h-1 bg-[#d0d4c8]">
                      <div
                        className="h-1 bg-current transition-all duration-300"
                        style={{
                          width: `${
                            (uploadProgress[section.id].current /
                              uploadProgress[section.id].total) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    {uploadProgress[section.id].errors.length > 0 && (
                      <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                        {uploadProgress[section.id].errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!section.photos.length && !uploadProgress[section.id] && (
                  <p className="text-xs opacity-40">Nessuna foto.</p>
                )}

                <div className="grid grid-cols-6 gap-2">
                  {section.photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail_url ?? photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs tracking-widest uppercase"
                      >
                        Elimina
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center gap-2 mt-4 pt-4 border-t border-[#d0d4c8] cursor-pointer opacity-30 hover:opacity-100 transition-opacity w-fit"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="text-xs" style={{ display: "inline-block", transform: "rotate(180deg)" }}>▾</span>
                  <span className="text-xs tracking-[0.2em] uppercase">Chiudi sezione</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      <form
        onSubmit={addSection}
        className="flex gap-4 items-end border-t border-[#d0d4c8] pt-8 mb-16"
      >
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs tracking-[0.2em] uppercase opacity-60">
            Nuova sezione
          </label>
          <input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="es. Cerimonia"
            className="border-b border-current bg-transparent py-2 text-lg tracking-wide outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={addingSection || !newSectionName.trim()}
          className="text-sm tracking-[0.2em] uppercase border border-current px-6 py-2 hover:opacity-60 transition-opacity disabled:opacity-40"
        >
          {addingSection ? "…" : "Aggiungi sezione"}
        </button>
      </form>

      {/* Danger zone */}
      <div className="border-t border-[#d0d4c8] pt-8">
        <button
          onClick={deleteGallery}
          disabled={deletingGallery}
          className="text-xs tracking-[0.2em] uppercase opacity-30 hover:opacity-100 transition-opacity disabled:opacity-20"
          style={{ color: "#b94a4a" }}
        >
          {deletingGallery ? "Eliminazione…" : "Elimina galleria"}
        </button>
      </div>
    </div>
  );
}
