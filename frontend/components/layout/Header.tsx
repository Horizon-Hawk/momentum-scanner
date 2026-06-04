"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BarChart2, LogIn } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={clsx(
        "text-sm font-medium transition-colors",
        pathname === href
          ? "text-green-400"
          : "text-gray-400 hover:text-gray-100"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 text-green-400 font-bold tracking-tight">
          <TrendingUp className="w-5 h-5" />
          <span>MomentumScan</span>
        </Link>

        <nav className="flex items-center gap-5">
          {navLink("/scanner", "Scanner")}
          {navLink("/pricing", "Pricing")}
          {userEmail && navLink("/dashboard", "Dashboard")}
        </nav>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <>
              <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[140px]">
                {userEmail}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-gray-400 hover:text-gray-100 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/?login=1"
              className="flex items-center gap-1.5 text-sm bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
