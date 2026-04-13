"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewGalleryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      couple_name: form.get("couple_name"),
      slug: form.get("slug"),
      wedding_date: form.get("wedding_date"),
      password: form.get("password") || null,
    };

    const res = await fetch("/api/admin/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const { id } = await res.json();
      router.push(`/admin/galleries/${id}`);
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Errore durante la creazione.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-4xl font-light tracking-widest mb-10">Nuova galleria</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Nomi degli sposi" name="couple_name" required />
        <Field
          label="Slug URL"
          name="slug"
          required
          hint="Es: giulia-e-marco — usato nell'indirizzo web"
        />
        <Field label="Data del matrimonio" name="wedding_date" type="date" required />
        <Field
          label="Password (opzionale)"
          name="password"
          type="password"
          hint="Lascia vuoto per una galleria pubblica"
        />

        {error && <p className="text-sm" style={{ color: "#b94a4a" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-start mt-4 text-sm tracking-[0.3em] uppercase border border-current px-8 py-3 hover:opacity-60 transition-opacity disabled:opacity-40"
        >
          {loading ? "…" : "Crea galleria"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs tracking-[0.2em] uppercase opacity-60">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="border-b border-current bg-transparent py-2 text-lg tracking-wide outline-none"
      />
      {hint && <p className="text-xs opacity-40 mt-1">{hint}</p>}
    </div>
  );
}
