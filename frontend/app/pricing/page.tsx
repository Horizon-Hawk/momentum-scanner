import Link from "next/link";
import { Check, Zap } from "lucide-react";

const FREE_FEATURES = [
  "Live real-time scanner",
  "Ross Cameron preset filters",
  "Top 10 matching results",
  "All columns: gap%, RVOL, float, HOD/LOD",
  "Market status indicator",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited results (no row cap)",
  "Fully customizable filters",
  "Save & load filter presets",
  "Priority data feed",
  "Email support",
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-100 mb-3">Simple pricing</h1>
        <p className="text-gray-400">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Free</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-gray-100">$0</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Always free. No credit card required.</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/scanner"
            className="block text-center bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Open Scanner
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-gray-900 border-2 border-green-500/50 rounded-2xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1 bg-green-500/15 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              Most Popular
            </span>
          </div>
          <div className="mb-6">
            <p className="text-sm font-medium text-green-400 mb-1">Pro</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-gray-100">$29</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Cancel anytime. No contracts.</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <UpgradeButton />
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">
        Prices in USD. Subscriptions renew monthly. Not financial advice.
      </p>
    </div>
  );
}

function UpgradeButton() {
  "use client";
  return (
    <form action="/api/subscribe" method="POST">
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-lg transition-colors text-sm"
      >
        Upgrade to Pro — $29/mo
      </button>
    </form>
  );
}
