"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="ml-auto text-sm tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity"
    >
      Esci
    </button>
  );
}
