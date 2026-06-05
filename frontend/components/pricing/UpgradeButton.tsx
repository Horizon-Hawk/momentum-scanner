"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpgradeButton() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, []);

  async function handleClick() {
    if (!authed) {
      router.push("/pricing?login=1");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/subscribe", { method: "POST" });
    if (res.redirected) {
      window.location.href = res.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold py-3 rounded-lg transition-colors text-sm"
    >
      {loading ? "Redirecting…" : "Upgrade to Pro — $29/mo"}
    </button>
  );
}
