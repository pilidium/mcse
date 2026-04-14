"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ArrowLeft, TrendingUp, Calendar, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { stockDirectory, ipoList, newsItems, type NewsItem, type IPO } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";
import Portal from "@/components/Portal";

const allStocks = Object.values(stockDirectory);
const trendingTickers = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC"];
const trending = trendingTickers.map(t => stockDirectory[t]).filter(Boolean);

type Filter = "ALL" | "STOCKS" | "IPO" | "NEWS";
const FILTERS: Filter[] = ["ALL", "STOCKS", "IPO", "NEWS"];

type SearchResult =
  | { kind: "stock"; data: (typeof allStocks)[number] }
  | { kind: "ipo"; data: IPO }
  | { kind: "news"; data: NewsItem };

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query/filter on open → derived from prop rather than an effect.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setFilter("ALL");
    }
  }

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const out: SearchResult[] = [];

    if (filter === "ALL" || filter === "STOCKS") {
      const stockMatches = allStocks
        .filter(
          (s) =>
            s.ticker.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q),
        )
        .slice(0, filter === "STOCKS" ? 50 : 10);
      for (const s of stockMatches) out.push({ kind: "stock", data: s });
    }

    if (filter === "ALL" || filter === "IPO") {
      const ipoMatches = ipoList
        .filter(
          (i) =>
            i.ticker.toLowerCase().includes(q) ||
            i.name.toLowerCase().includes(q),
        )
        .slice(0, filter === "IPO" ? 50 : 10);
      for (const i of ipoMatches) out.push({ kind: "ipo", data: i });
    }

    if (filter === "ALL" || filter === "NEWS") {
      const newsMatches = newsItems
        .filter(
          (n) =>
            n.headline.toLowerCase().includes(q) ||
            n.ticker.toLowerCase().includes(q) ||
            n.name.toLowerCase().includes(q),
        )
        .slice(0, filter === "NEWS" ? 50 : 10);
      for (const n of newsMatches) out.push({ kind: "news", data: n });
    }

    return out;
  }, [query, filter]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const showResults = query.trim().length > 0;

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-bg z-[60] flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Search header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center shrink-0 -ml-2"
            >
              <ArrowLeft size={20} className="text-white/60" />
            </button>
            <div className="flex-1 flex items-center gap-2.5 bg-white/[0.06] px-4 py-3">
              <Search size={16} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks, IPOs, news…"
                className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 shrink-0 overflow-x-auto scrollbar-hide">
            {FILTERS.map((chip) => {
              const active = filter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setFilter(chip)}
                  className={`px-4 py-2.5 text-[10px] tracking-[0.12em] font-medium border whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "bg-white text-black border-white"
                      : "text-white/50 border-white/15 active:bg-white/10"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {!showResults ? (
              /* Trending section (no query) */
              <div className="px-4 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-white/30" />
                  <p className="text-[10px] tracking-[0.15em] text-white/30 font-medium">TRENDING</p>
                </div>
                <div className="space-y-1">
                  {trending.map((s) => (
                    <Link
                      key={s.ticker}
                      href={`/stock/${s.ticker}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 px-1 border-b border-white/6 active:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
                        <span className="text-[9px] tracking-[0.1em] text-white/40">{s.ticker.slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
                        <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                        <p className={`text-[10px] font-medium ${s.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                          {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <p className="text-[10px] tracking-[0.15em] text-white/30 font-medium mt-8 mb-4">ALL STOCKS</p>
                <div className="space-y-1">
                  {allStocks.slice(0, 15).map((s) => (
                    <Link
                      key={s.ticker}
                      href={`/stock/${s.ticker}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 px-1 border-b border-white/6 active:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
                        <span className="text-[9px] tracking-[0.1em] text-white/40">{s.ticker.slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
                        <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                      </div>
                      <div className="shrink-0 mr-2">
                        <Sparkline data={s.chartData["1D"].map((d) => d.price)} width={50} height={18} positive={s.changePercent >= 0} />
                      </div>
                      <div className="text-right shrink-0 min-w-[70px]">
                        <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                        <p className={`text-[10px] font-medium ${s.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                          {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[11px] text-white/25 tracking-[0.1em]">NO RESULTS FOUND</p>
                <p className="text-[10px] text-white/15 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-0">
                {results.map((r) => {
                  if (r.kind === "stock") {
                    const s = r.data;
                    return (
                      <Link
                        key={`stock-${s.ticker}`}
                        href={`/stock/${s.ticker}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] transition-colors"
                      >
                        <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
                          <span className="text-[9px] tracking-[0.1em] text-white/40">{s.ticker.slice(0, 3)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
                          <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                        </div>
                        <div className="shrink-0 mr-2">
                          <Sparkline data={s.chartData["1D"].map((d) => d.price)} width={50} height={18} positive={s.changePercent >= 0} />
                        </div>
                        <div className="text-right shrink-0 min-w-[70px]">
                          <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                          <p className={`text-[10px] font-medium ${s.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                            {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </Link>
                    );
                  }
                  if (r.kind === "ipo") {
                    const i = r.data;
                    const statusColor =
                      i.status === "LIVE" ? "text-[#00D26A] border-[#00D26A]/30" :
                      i.status === "UPCOMING" ? "text-white/60 border-white/20" :
                      "text-white/30 border-white/10";
                    return (
                      <Link
                        key={`ipo-${i.ticker}`}
                        href="/ipo"
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] transition-colors"
                      >
                        <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em] truncate">{i.name}</p>
                            <span className="text-[8px] tracking-[0.12em] px-1.5 py-0.5 border border-white/15 text-white/40 shrink-0">IPO</span>
                          </div>
                          <p className="text-[10px] text-white/30 truncate">{i.dateStart} – {i.dateEnd} · {"\u20B9"}{i.priceLow}–{i.priceHigh}</p>
                        </div>
                        <span className={`text-[8px] tracking-[0.12em] px-2 py-1 border shrink-0 ${statusColor}`}>
                          {i.status}
                        </span>
                      </Link>
                    );
                  }
                  const n = r.data;
                  return (
                    <Link
                      key={`news-${n.ticker}-${n.timestamp}`}
                      href={n.ticker ? `/stock/${n.ticker}` : "/news"}
                      onClick={onClose}
                      className="flex items-start gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
                        <Newspaper size={14} className="text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/80 leading-snug line-clamp-2">{n.headline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {n.ticker && (
                            <span className="font-[var(--font-anton)] text-[10px] tracking-[0.05em] text-white/50">{n.ticker}</span>
                          )}
                          <span className="text-[9px] text-white/25">{timeAgo(n.timestamp)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="px-5 py-3 text-center">
                  <span className="text-[9px] text-white/20 tracking-[0.1em]">
                    {results.length} RESULT{results.length !== 1 ? "S" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
