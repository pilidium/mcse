"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { newsItems, formatRelativeTime, allStocksEnriched } from "@/lib/mockData";

const sectors = ["ALL", ...Array.from(new Set(allStocksEnriched.map((s) => s.sector)))];

export default function NewsPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return newsItems.map((n, i) => ({ news: n, id: i }));
    return newsItems
      .map((n, i) => ({ news: n, id: i }))
      .filter(({ news }) => {
        const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);
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
        {filtered.map(({ news, id }, i) => {
          const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/news/${id}`}
                className="block border border-white/6 p-5 hover:bg-white/[0.03] hover:border-white/12 transition-all duration-300 h-full"
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
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-[11px] text-white/25 py-16 text-center tracking-[0.1em]">NO STORIES IN THIS SECTOR</p>
      )}
    </div>
  );
}
