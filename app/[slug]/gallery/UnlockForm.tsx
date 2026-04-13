"use client";

import { useActionState } from "react";
import { unlockGallery } from "./actions";

type Props = {
  slug: string;
  coupleName: string;
};

export function UnlockForm({ slug, coupleName }: Props) {
  const [state, action, isPending] = useActionState(
    unlockGallery.bind(null, slug),
    null
  );

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Lock icon */}
      <div className="mb-8" style={{ color: "#d0d4c8" }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-3 text-center">
        Galleria protetta
      </h1>
      <p
        className="text-xs tracking-[0.35em] uppercase mb-12"
        style={{ color: "#6b6b60" }}
      >
        {coupleName}
      </p>

      <form
        action={action}
        className="flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="w-full border-b border-[#1a1a18] bg-transparent py-2 text-center text-lg tracking-widest outline-none placeholder:opacity-30 placeholder:text-sm"
        />

        {state?.error && (
          <p className="text-sm mt-1" style={{ color: "#b94a4a" }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 text-xs tracking-[0.35em] uppercase border border-[#1a1a18] px-10 py-3 hover:bg-[#1a1a18] hover:text-[#e9ede1] transition-colors duration-200 disabled:opacity-40"
        >
          {isPending ? "…" : "Entra"}
        </button>
      </form>
    </main>
  );
}
