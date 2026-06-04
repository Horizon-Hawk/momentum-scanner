import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="font-semibold text-gray-300">MomentumScan</span>
          <span>— Real-time momentum scanner</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
          <Link href="/scanner" className="hover:text-gray-300 transition-colors">Scanner</Link>
          <a href="mailto:support@momentumscan.io" className="hover:text-gray-300 transition-colors">Support</a>
        </div>
        <p className="text-xs text-gray-600">
          Not financial advice. For educational purposes only.
        </p>
      </div>
    </footer>
  );
}
