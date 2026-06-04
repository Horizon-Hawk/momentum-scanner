import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/?login=1");

  const service = createServiceClient();
  const { data: sub } = await service
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const isPro = sub?.tier === "pro" && sub?.status === "active";

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-US", { dateStyle: "medium" })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Dashboard</h1>

      {/* Account */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
        <p className="text-gray-300 text-sm">
          <span className="text-gray-500">Email: </span>{user.email}
        </p>
      </section>

      {/* Subscription */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Subscription</h2>
        {isPro ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-green-400">Pro</span>
                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              {periodEnd && (
                <p className="text-sm text-gray-500">Renews {periodEnd}</p>
              )}
            </div>
            <Link href="/scanner" className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors">
              Open Scanner <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-400">Free</span>
              </div>
              <p className="text-sm text-gray-500">Top 10 results · Default filters only</p>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Quick links</h2>
        <div className="flex flex-col gap-2">
          <Link href="/scanner" className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm text-gray-300 hover:text-gray-100 transition-colors">
            <span>Live Scanner</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
          </Link>
          <Link href="/pricing" className="flex items-center justify-between py-2 text-sm text-gray-300 hover:text-gray-100 transition-colors">
            <span>Pricing</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
          </Link>
        </div>
      </section>
    </div>
  );
}
