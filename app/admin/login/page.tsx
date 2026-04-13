"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Errore");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <h1 className="text-3xl font-light tracking-widest mb-10 text-center">
          Admin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-[0.2em] uppercase opacity-60">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="border-b border-current bg-transparent py-2 text-lg tracking-wide outline-none"
            />
          </div>
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
            {loading ? "…" : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
