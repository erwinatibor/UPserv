import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          UPserv
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-900">
            Dashboard
          </Link>
          <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
