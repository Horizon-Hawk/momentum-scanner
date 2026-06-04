import Link from "next/link";
import { TrendingUp, Zap, Filter, BarChart2, ChevronRight } from "lucide-react";

const MOCK_TICKERS = [
  { ticker: "ABCD", price: "4.82", gap: "+28.4%", rvol: "18.2x", float: "3.1M" },
  { ticker: "WXYZ", price: "7.15", gap: "+19.7%", rvol: "12.5x", float: "6.8M" },
  { ticker: "EFGH", price: "2.34", gap: "+15.2%", rvol: "9.1x",  float: "11.2M" },
  { ticker: "IJKL", price: "11.60", gap: "+13.8%", rvol: "7.4x", float: "14.5M" },
  { ticker: "MNOP", price: "8.91", gap: "+12.1%", rvol: "6.8x",  float: "18.9M" },
];

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-green-400" />,
    title: "Real-time feed",
    desc: "Prices update every minute from Databento's US equities feed — the same data professionals use.",
  },
  {
    icon: <Filter className="w-5 h-5 text-green-400" />,
    title: "Momentum presets",
    desc: "Pre-loaded with proven small-cap filters: $1–$20, ≤20M float, ≥10% gap, ≥5× RVOL.",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-green-400" />,
    title: "Custom filters (Pro)",
    desc: "Dial in your own thresholds, save multiple presets, and see unlimited results in one click.",
  },
];

const STEPS = [
  { n: "01", title: "Scanner watches the market", body: "Every minute, we process every US stock and calculate gap%, RVOL, float, and price in real time." },
  { n: "02", title: "Filters catch the setups",   body: "Only stocks matching the momentum criteria appear — no noise, no manual searching." },
  { n: "03", title: "You make the call",           body: "Tap a ticker to open a chart. You decide whether the setup fits your trading plan." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800 py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live market data · Updated every minute
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-50 leading-tight mb-4">
              Spot momentum plays<br />
              <span className="text-green-400">before they run</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Real-time small-cap scanner. Gap%, RVOL, and float — all pre-filtered, no setup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/scanner"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Open Scanner Free
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg transition-colors text-sm"
              >
                See Pricing
              </Link>
            </div>
          </div>

          {/* Mock scanner preview */}
          <div className="w-full lg:w-[420px] shrink-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">LIVE — {MOCK_TICKERS.length} matching</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Ticker","Price","Gap%","RVOL","Float"].map((h) => (
                      <th key={h} className="px-3 py-2 text-gray-600 font-medium text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TICKERS.map((t, i) => (
                    <tr key={t.ticker} className={`border-b border-gray-800/60 ${i === 0 ? "bg-green-500/5" : ""}`}>
                      <td className="px-3 py-2 font-mono font-semibold text-green-400">{t.ticker}</td>
                      <td className="px-3 py-2 font-mono text-green-300">${t.price}</td>
                      <td className="px-3 py-2">
                        <span className="bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold">{t.gap}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold">{t.rvol}</span>
                      </td>
                      <td className="px-3 py-2 text-green-400 font-mono">{t.float}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-600 italic">
              Illustrative data — real scanner shows live results
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-100 mb-10">
            Everything a momentum trader needs
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-100 mb-10">How it works</h2>
          <div className="space-y-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center font-mono text-green-400 text-sm font-bold">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-3">Start scanning for free</h2>
          <p className="text-gray-400 mb-6 text-sm">
            No credit card required. Top 10 results always free.
            Upgrade to Pro for unlimited live access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/scanner"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Open Scanner Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg transition-colors text-sm"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
