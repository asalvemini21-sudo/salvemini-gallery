"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/galleries/${params.slug}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(`/${params.slug}?unlocked=1`);
    } else {
      setError("Password errata. Riprova.");
    }
    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <h1 className="text-4xl font-light tracking-widest mb-2">Galleria protetta</h1>
      <p className="text-sm tracking-widest uppercase mb-10" style={{ color: "#6b6b60" }}>
        Inserisci la password per accedere
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border-b border-current bg-transparent py-2 text-center text-lg tracking-widest outline-none placeholder:opacity-40"
        />
        {error && (
          <p className="text-sm" style={{ color: "#b94a4a" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 text-sm tracking-[0.3em] uppercase border border-current px-8 py-3 hover:opacity-60 transition-opacity disabled:opacity-40"
        >
          {loading ? "…" : "Entra"}
        </button>
      </form>
    </main>
  );
}
