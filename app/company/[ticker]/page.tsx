"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Users, Calendar, Building2, ExternalLink, TrendingUp, DollarSign, Target, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { parentDirectory, stockDirectory, newsItems, formatRelativeTime } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";
import { getCompanyGameState, getCredibility, CompanyGameState, CredibilityData } from "@/lib/api";

// Metrics Panel component
function MetricsPanel({ gameState, ticker }: { gameState: CompanyGameState | null; ticker: string }) {
  if (!gameState || gameState.subsidiaries.length === 0) {
    return (
      <div className="border border-white/6 p-5">
        <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">BUSINESS METRICS</p>
        <div className="h-24 flex items-center justify-center">
          <p className="text-[11px] text-white/20">No metrics available</p>
        </div>
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalRevenue = gameState.subsidiaries.reduce((s, sub) => s + sub.revenue, 0);
  const totalProfit = gameState.subsidiaries.reduce((s, sub) => s + sub.profit, 0);
  const totalCash = gameState.subsidiaries.reduce((s, sub) => s + sub.cash, 0);
  const totalDebt = gameState.subsidiaries.reduce((s, sub) => s + sub.debt, 0);
  const avgQuality = Math.round(gameState.subsidiaries.reduce((s, sub) => s + sub.productQuality, 0) / gameState.subsidiaries.length);
  const avgSatisfaction = Math.round(gameState.subsidiaries.reduce((s, sub) => s + sub.customerSatisfaction, 0) / gameState.subsidiaries.length);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <div className="border border-white/6 p-5">
      <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">BUSINESS METRICS</p>
      
      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.02] p-3 rounded-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={10} className="text-white/30" />
            <span className="text-[9px] text-white/30">Revenue</span>
          </div>
          <p className="font-[var(--font-anton)] text-[14px] text-white/80">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white/[0.02] p-3 rounded-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={10} className="text-white/30" />
            <span className="text-[9px] text-white/30">Profit</span>
          </div>
          <p className={`font-[var(--font-anton)] text-[14px] ${totalProfit >= 0 ? "text-up" : "text-down"}`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      {/* Cash & Debt */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-white/30">Cash</span>
          <span className="text-[11px] text-white/60">{formatCurrency(totalCash)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-white/30">Debt</span>
          <span className="text-[11px] text-white/60">{formatCurrency(totalDebt)}</span>
        </div>
      </div>

      <div className="h-px bg-white/6 mb-4" />

      {/* Operational metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target size={10} className="text-white/25" />
            <span className="text-[10px] text-white/40">Product Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-up rounded-full" style={{ width: `${avgQuality}%` }} />
            </div>
            <span className="text-[11px] font-medium text-white/60">{avgQuality}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-white/25" />
            <span className="text-[10px] text-white/40">Customer Satisfaction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgSatisfaction}%` }} />
            </div>
            <span className="text-[11px] font-medium text-white/60">{avgSatisfaction}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Credibility Panel component
function CredibilityPanel({ credibility }: { credibility: CredibilityData | null }) {
  if (!credibility) {
    return (
      <div className="border border-white/6 p-5">
        <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">CREDIBILITY</p>
        <div className="h-24 flex items-center justify-center">
          <p className="text-[11px] text-white/20">Loading...</p>
        </div>
      </div>
    );
  }

  const score = credibility.currentScore;
  const scoreColor = score >= 70 ? "text-up" : score >= 40 ? "text-yellow-400" : "text-down";

  return (
    <div className="border border-white/6 p-5">
      <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">CREDIBILITY SCORE</p>
      
      {/* Score display */}
      <div className="text-center mb-4">
        <p className={`font-[var(--font-anton)] text-[32px] ${scoreColor}`}>{score.toFixed(1)}</p>
        <p className="text-[9px] text-white/30">OUT OF 100</p>
      </div>

      {/* Score bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${score >= 70 ? "bg-up" : score >= 40 ? "bg-yellow-400" : "bg-down"}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Recent events */}
      {credibility.recentEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-white/25">Recent impacts</p>
          {credibility.recentEvents.slice(0, 3).map((event, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 truncate flex-1">{event.type.replace(/_/g, " ")}</span>
              <span className={`text-[10px] font-medium ${event.impact >= 0 ? "text-up" : "text-down"}`}>
                {event.impact >= 0 ? "+" : ""}{event.impact.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const router = useRouter();
  const company = parentDirectory[ticker.toUpperCase()];

  const [gameState, setGameState] = useState<CompanyGameState | null>(null);
  const [credibility, setCredibility] = useState<CredibilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [gameRes, credRes] = await Promise.all([
        getCompanyGameState(),
        getCredibility(ticker.toUpperCase()),
      ]);
      if (gameRes.data) setGameState(gameRes.data);
      if (credRes.data) setCredibility(credRes.data);
      setLoading(false);
    }
    if (company) {
      fetchData();
    }
  }, [ticker, company]);

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
                        data={sub.chartData["1D"].map((d) => d.price)}
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

            {/* News & Events */}
            <div>
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">LATEST NEWS</p>
              {(() => {
                const subTickers = company.subsidiaries;
                const companyNews = newsItems.filter(n => subTickers.includes(n.ticker));
                const companyEvents = subsidiaries.flatMap(s => (s.events || []).map(e => ({ ...e, ticker: s.ticker })));
                if (companyNews.length === 0 && companyEvents.length === 0) {
                  return (
                    <div className="border border-white/6 border-dashed p-8 text-center">
                      <Calendar size={20} className="mx-auto text-white/10 mb-3" />
                      <p className="text-[11px] tracking-[0.1em] text-white/20">No news or events yet</p>
                      <p className="text-[9px] text-white/10 mt-1.5">Updates will appear here during APR 24{"\u2013"}26</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {companyNews.slice(0, 3).map((news, i) => (
                      <Link key={i} href={`/stock/${news.ticker}`} className="block border border-white/6 p-4 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-[var(--font-anton)] text-[10px] tracking-[0.05em] text-white/40">{news.ticker}</span>
                          <span className={`text-[9px] font-medium ${news.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                            {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{news.headline}</p>
                        <p className="text-[8px] text-white/15 mt-1.5">{formatRelativeTime(news.timestamp)}</p>
                      </Link>
                    ))}
                    {companyEvents.slice(0, 2).map((event, i) => (
                      <div key={`ev-${i}`} className="border border-white/6 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] tracking-[0.1em] text-white/20 px-1.5 py-0.5 border border-white/8">{event.type}</span>
                          <p className="text-[11px] text-white/50">{event.title}</p>
                        </div>
                        <span className="text-[9px] text-white/20 ml-2">{event.ticker}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Credibility Panel */}
            <CredibilityPanel credibility={credibility} />
            
            {/* Business Metrics Panel */}
            <MetricsPanel gameState={gameState} ticker={ticker} />
            
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
