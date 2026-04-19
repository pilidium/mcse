"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { newsItems, formatRelativeTime, allStocksEnriched } from "@/lib/mockData";

export default function NewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const index = parseInt(id, 10);
  const news = newsItems[index];

  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <h1 className="font-[var(--font-anton)] text-2xl tracking-[0.1em] uppercase mb-4">ARTICLE NOT FOUND</h1>
        <Link href="/news" className="text-[10px] tracking-[0.15em] text-white/40 hover:text-white transition-colors">
          ← BACK TO NEWS
        </Link>
      </div>
    );
  }

  const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);

  return (
    <div className="mobile-content-pad max-w-2xl mx-auto py-6">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-[10px] tracking-[0.15em]">BACK</span>
      </motion.button>

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Meta */}
        <div className="flex items-center gap-3 mb-5">
          <span className="font-[var(--font-anton)] text-[11px] tracking-[0.1em] text-white/50">{news.ticker}</span>
          {stock && (
            <span className="text-[8px] tracking-[0.12em] text-white/20 px-1.5 py-0.5 border border-white/8">
              {stock.sector}
            </span>
          )}
          <span className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
            {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.03em] leading-snug mb-6">
          {news.headline}
        </h1>

        {/* Byline */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/8">
          <span className="text-[10px] text-white/40">{news.name}</span>
          <span className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</span>
          <span className="text-[10px] text-white/30 ml-auto">
            {"\u20B9"}{news.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Body */}
        <div className="text-[13px] md:text-[14px] text-white/55 leading-[1.9] whitespace-pre-line mb-10">
          {news.body}
        </div>

        {/* Footer link */}
        <div className="pt-6 border-t border-white/8">
          <Link
            href={`/stock/${news.ticker}`}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] text-white/40 hover:text-white border border-white/15 hover:border-white/40 px-4 py-2.5 transition-all duration-200"
          >
            VIEW {news.ticker} DETAILS
          </Link>
        </div>
      </motion.article>
    </div>
  );
}
