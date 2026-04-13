import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[#d0d4c8] px-8 py-4 flex items-center gap-8">
        <Link href="/admin" className="text-xl font-light tracking-widest">
          Salvemini Gallery
        </Link>
        <Link
          href="/admin/galleries"
          className="text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
        >
          Gallerie
        </Link>
        <LogoutButton />
      </nav>
      <main className="flex-1 px-8 py-10">{children}</main>
    </div>
  );
}
