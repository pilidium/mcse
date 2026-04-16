"use client";

import { use } from "react";
import { ArrowLeft, Users, Calendar, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { parentDirectory, stockDirectory } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const router = useRouter();
  const company = parentDirectory[ticker.toUpperCase()];

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[11px] tracking-[0.2em] text-white/30 uppercase">Company not found</p>
          <Link href="/" className="text-[11px] tracking-[0.15em] text-white/50 border-b border-white/20 pb-0.5 hover:text-white hover:border-white transition-colors">
            BACK TO EXPLORE
          </Link>
        </div>
      </div>
    );
  }

  // Gather subsidiary data
  const subsidiaries = company.subsidiaries.map((t) => stockDirectory[t]).filter(Boolean);
  const totalMarketCap = subsidiaries.reduce((sum, s) => {
    const mcStr = s.fundamentals.marketCap;
    const num = parseFloat(mcStr.replace("Cr", ""));
    return sum + num;
  }, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-white/8">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white active:bg-white/[0.04] transition-colors duration-150"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="w-12 h-12 border border-white/25 flex items-center justify-center">
            <span className="font-[var(--font-anton)] text-lg tracking-wide text-white/70">{company.logoLetter}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.05em]">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] tracking-[0.15em] text-white/30">{company.ticker}</span>
              <span className="text-[8px] tracking-[0.1em] text-white/20 px-1.5 py-0.5 border border-white/8">{company.sector}</span>
              <span className="text-[8px] tracking-[0.1em] text-white/20 px-1.5 py-0.5 border border-white/8">HOLDING CO.</span>
            </div>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* Left column */}
          <div className="space-y-8">
            {/* About */}
            <div>
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-3">ABOUT</p>
              <p className="text-[13px] leading-[1.8] text-white/60">{company.about}</p>
            </div>

            {/* Subsidiaries */}
            <div>
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">SUBSIDIARIES</p>
              <div className="space-y-3">
                {subsidiaries.map((sub, i) => (
                  <motion.div
                    key={sub.ticker}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={`/stock/${sub.ticker}`}
                      className="flex items-center gap-4 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-[var(--font-anton)] text-[14px] tracking-[0.05em]">{sub.ticker}</p>
                          <ExternalLink size={10} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                        <p className="text-[11px] text-white/40 mt-1">{sub.name}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{sub.fundamentals.sector}</p>
                      </div>
                      <Sparkline
                        data={sub.chartData["1W"].map((d) => d.price)}
                        width={60}
                        height={24}
                        positive={sub.changePercent >= 0}
                      />
                      <div className="text-right shrink-0 min-w-[90px]">
                        <p className="font-[var(--font-anton)] text-[14px]">
                          {"\u20B9"}{sub.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[11px] font-medium mt-0.5 ${sub.changePercent >= 0 ? "text-up" : "text-down"}`}>
                          {sub.changePercent >= 0 ? "+" : ""}{sub.changePercent.toFixed(2)}%
                        </p>
                        <p className="text-[9px] text-white/20 mt-0.5">MCap {sub.fundamentals.marketCap}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Key Facts */}
            <div className="border border-white/6 p-5">
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">KEY FACTS</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={12} className="text-white/20" />
                    <span className="text-[11px] text-white/40">Subsidiaries</span>
                  </div>
                  <span className="font-[var(--font-anton)] text-[13px]">{company.subsidiaries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-white/20" />
                    <span className="text-[11px] text-white/40">Total Members</span>
                  </div>
                  <span className="font-[var(--font-anton)] text-[13px]">{company.totalEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-white/20" />
                    <span className="text-[11px] text-white/40">Founded</span>
                  </div>
                  <span className="font-[var(--font-anton)] text-[13px]">{company.founded}</span>
                </div>
                <div className="h-px bg-white/6" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">Combined MCap</span>
                  <span className="font-[var(--font-anton)] text-[13px]">{totalMarketCap.toFixed(1)}Cr</span>
                </div>
              </div>
            </div>

            {/* Sector Breakdown */}
            <div className="border border-white/6 p-5">
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">SECTOR BREAKDOWN</p>
              <div className="space-y-3">
                {subsidiaries.map((sub) => (
                  <div key={sub.ticker} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">{sub.ticker}</span>
                    <span className="text-[10px] text-white/25">{sub.fundamentals.sector}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="border border-white/6 p-5">
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">PERFORMANCE</p>
              <div className="space-y-3">
                {subsidiaries.map((sub) => (
                  <div key={sub.ticker} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">{sub.ticker}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/25">P/E {sub.fundamentals.pe}</span>
                      <span className="text-[10px] text-white/25">ROE {sub.fundamentals.roe}%</span>
                      <span className={`text-[11px] font-medium ${sub.changePercent >= 0 ? "text-up" : "text-down"}`}>
                        {sub.changePercent >= 0 ? "+" : ""}{sub.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
