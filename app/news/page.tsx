"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { newsItems, formatRelativeTime, allStocksEnriched } from "@/lib/mockData";

const sectors = ["ALL", ...Array.from(new Set(allStocksEnriched.map((s) => s.sector)))];

export default function NewsPage() {
  const [filter, setFilter] = useState("ALL");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return newsItems;
    return newsItems.filter((n) => {
      const stock = allStocksEnriched.find((s) => s.ticker === n.ticker);
      return stock?.sector === filter;
    });
  }, [filter]);

  return (
    <div className="py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">NEWS</h1>
        <span className="text-[9px] tracking-[0.2em] text-white/20">{filtered.length} STORIES</span>
      </div>

      {/* Sector filter */}
      <div className="flex flex-wrap gap-0 mb-8 border-b border-white/8 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-[10px] tracking-[0.12em] px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              filter === s ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((news, i) => {
          const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);
          return (
            <motion.div
              key={`${news.ticker}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => setExpandedIndex(i)}
                className="block w-full text-left border border-white/6 p-5 hover:bg-white/[0.03] hover:border-white/12 transition-all duration-300 h-full"
              >
                <div className="flex items-center gap-2 mb-3">
                  {stock && (
                    <span className="text-[8px] tracking-[0.12em] text-white/20 px-1.5 py-0.5 border border-white/8">
                      {stock.sector}
                    </span>
                  )}
                  <span className="font-[var(--font-anton)] text-[10px] tracking-[0.06em] text-white/50">{news.ticker}</span>
                  <span className={`text-[9px] font-medium ml-auto ${news.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                    {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-[12px] text-white/60 leading-[1.7] line-clamp-3 mb-4">{news.headline}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-white/30">{news.name}</span>
                  <span className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-[11px] text-white/25 py-16 text-center tracking-[0.1em]">NO STORIES IN THIS SECTOR</p>
      )}

      {/* Full article overlay */}
      <AnimatePresence>
        {expandedIndex !== null && filtered[expandedIndex] && (() => {
          const news = filtered[expandedIndex];
          const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpandedIndex(null)}
                className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-4 md:inset-x-auto md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[61] bg-bg border border-white/10 overflow-y-auto"
              >
                <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-md border-b border-white/8 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-[var(--font-anton)] text-[11px] tracking-[0.1em] text-white/50">{news.ticker}</span>
                    {stock && (
                      <span className="text-[8px] tracking-[0.12em] text-white/20 px-1.5 py-0.5 border border-white/8">{stock.sector}</span>
                    )}
                    <span className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedIndex(null)}
                    className="w-9 h-9 border border-white/15 flex items-center justify-center hover:border-white/40 transition-colors"
                  >
                    <X size={14} className="text-white/50" />
                  </button>
                </div>

                <div className="px-6 py-6">
                  <h2 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.03em] leading-snug mb-4">{news.headline}</h2>

                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/8">
                    <span className="text-[10px] text-white/40">{news.name}</span>
                    <span className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</span>
                    <span className="text-[10px] text-white/30 ml-auto">{"\u20B9"}{news.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="text-[13px] text-white/55 leading-[1.9] whitespace-pre-line">{news.body}</div>

                  <div className="mt-8 pt-4 border-t border-white/8">
                    <Link
                      href={`/stock/${news.ticker}`}
                      className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] text-white/40 hover:text-white border border-white/15 hover:border-white/40 px-4 py-2.5 transition-all duration-200"
                    >
                      VIEW {news.ticker} DETAILS
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
