"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ArrowLeft, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { stockDirectory } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

const allStocks = Object.values(stockDirectory);
const trendingTickers = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC"];
const trending = trendingTickers.map(t => stockDirectory[t]).filter(Boolean);

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allStocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const showResults = query.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-bg z-[60] flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Search header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={20} className="text-white/60" />
            </button>
            <div className="flex-1 flex items-center gap-2.5 bg-white/[0.06] px-4 py-2.5">
              <Search size={16} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks…"
                className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 shrink-0 overflow-x-auto scrollbar-hide">
            {["ALL", "STOCKS", "IPO", "ETF", "NEWS"].map((chip, i) => (
              <span
                key={chip}
                className={`px-3.5 py-1.5 text-[10px] tracking-[0.12em] font-medium border whitespace-nowrap ${
                  i === 0
                    ? "bg-white text-black border-white"
                    : "text-white/40 border-white/15"
                }`}
              >
                {chip}
              </span>
            ))}
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
                {results.map((s) => (
                  <Link
                    key={s.ticker}
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
                ))}
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
  );
}
