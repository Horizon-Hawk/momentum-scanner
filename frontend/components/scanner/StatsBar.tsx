"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Wifi } from "lucide-react";

interface Props {
  count: number;
  compact?: boolean;
}

function useMarketStatus() {
  const [status, setStatus] = useState<"open" | "pre" | "after" | "closed">("closed");
  useEffect(() => {
    function check() {
      const now = new Date();
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const h = et.getHours(), m = et.getMinutes();
      const mins = h * 60 + m;
      const day = et.getDay();
      if (day === 0 || day === 6) { setStatus("closed"); return; }
      if (mins >= 570 && mins < 810) { setStatus("open"); return; }    // 9:30–13:30
      if (mins >= 240 && mins < 570) { setStatus("pre"); return; }     // 4:00–9:30
      if (mins >= 810 && mins < 960) { setStatus("after"); return; }   // 13:30–16:00
      setStatus("closed");
    }
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);
  return status;
}

function useEtTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const STATUS_STYLES = {
  open:   { dot: "bg-green-400 animate-pulse", label: "Market Open",      text: "text-green-400" },
  pre:    { dot: "bg-yellow-400 animate-pulse", label: "Pre-market",      text: "text-yellow-400" },
  after:  { dot: "bg-yellow-400",               label: "After Hours",     text: "text-yellow-400" },
  closed: { dot: "bg-gray-500",                 label: "Market Closed",   text: "text-gray-400" },
};

export function StatsBar({ count, compact }: Props) {
  const status = useMarketStatus();
  const etTime = useEtTime();
  const s = STATUS_STYLES[status];

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className={`flex items-center gap-1.5 font-medium ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        <span className="text-gray-400">
          <span className="font-semibold text-gray-200">{count}</span> matching
        </span>
        <span className="text-gray-500 font-mono">{etTime} ET</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 px-1 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className={`font-medium ${s.text}`}>{s.label}</span>
      </div>

      <div className="flex items-center gap-1.5 text-gray-400">
        <Activity className="w-3.5 h-3.5" />
        <span>
          <span className="font-semibold text-gray-200">{count}</span> matching
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>{etTime} ET</span>
      </div>

      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <Wifi className="w-3.5 h-3.5" />
        <span>Realtime</span>
      </div>
    </div>
  );
}
