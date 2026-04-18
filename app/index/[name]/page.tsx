"use client";

import { useState, use, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { indexDirectory, stockDirectory } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

const timeRanges = ["1H", "3H", "1D", "3D", "ALL"] as const;

export default function IndexDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const idx = indexDirectory[name];
  const [range, setRange] = useState<string>("1D");
  const [chartType, setChartType] = useState<"LINE" | "CANDLE">("LINE");

  const candleData = useMemo(() => {
    if (!idx) return [];
    const cd = idx.chartData[range] || idx.chartData["1D"];
    const vals = cd.map((d) => d.price);
    const n = vals.length;
    if (n < 2) return [];
    const candles: { open: number; close: number; high: number; low: number }[] = [];
    for (let i = 1; i < n; i++) {
      const open = vals[i - 1];
      const close = vals[i];
      const spread = 0.001 + (((i * 7 + 3) % 11) / 11) * 0.002;
      const high = Math.max(open, close) * (1 + spread);
      const low = Math.min(open, close) * (1 - spread);
      candles.push({ open, close, high, low });
    }
    return candles;
  }, [idx, range]);

  if (!idx) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[var(--font-anton)] text-2xl tracking-[0.1em] uppercase mb-2"
        >
          INDEX NOT FOUND
        </motion.h1>
        <p className="text-[11px] text-white/40 mb-4">{name}</p>
        <Link
          href="/"
          className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
        >
          BACK TO EXPLORE
        </Link>
      </div>
    );
  }

  const chartData = idx.chartData[range] || idx.chartData["1D"];
  const chartValues = chartData.map((d) => d.price);

  const constituents = idx.constituents
    .map((t) => stockDirectory[t])
    .filter(Boolean);

  return (
    <div className="mobile-content-pad">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-4 border-b border-white/8">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white active:bg-white/[0.04] transition-colors duration-150"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <span className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.05em]">{idx.name}</span>
            <p className="text-[10px] text-white/40">Market Index</p>
          </div>
        </div>
      </div>

      {/* Desktop: 2-column grid */}
      <div className="lg:grid lg:grid-cols-[7fr_3fr] lg:gap-0 py-6">
        {/* Main content */}
        <div className="min-w-0 lg:pr-6">
          {/* Price */}
          <div className="mb-7 md:mb-8">
            <p className="font-[var(--font-anton)] text-3xl md:text-4xl tracking-tight mb-1.5">
              {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-3">
              <p className={`text-[12px] font-medium ${idx.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                {idx.changePercent >= 0 ? "+" : ""}{idx.change.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                {" "}({idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%) {"\u00B7"} {range}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-5 md:mb-6 md:border md:border-white/8 -mx-4 px-4 md:mx-0 md:p-6 py-4">
            <div className="w-full overflow-hidden">
              {chartType === "LINE" ? (
                <Sparkline
                  data={chartValues}
                  width={960}
                  height={280}
                  strokeWidth={1.5}
                  positive={idx.changePercent >= 0}
                  interactive
                  labels={chartData.map((d) => d.day)}
                  baseline={["1H", "3H", "1D"].includes(range) ? chartValues[0] : undefined}
                />
              ) : (
                <svg viewBox="0 0 960 280" width={960} height={280} className="block overflow-visible" style={{ maxWidth: '100%', height: 'auto' }}>
                  {candleData.map((c, i) => {
                    const n = candleData.length;
                    const candleW = 960 / n;
                    const cx = i * candleW + candleW / 2;
                    const allVals = candleData.flatMap((cc) => [cc.high, cc.low]);
                    const cMin = Math.min(...allVals);
                    const cMax = Math.max(...allVals);
                    const cRange = cMax - cMin || 1;
                    const yH = 10 + ((cMax - c.high) / cRange) * 260;
                    const yL = 10 + ((cMax - c.low) / cRange) * 260;
                    const yO = 10 + ((cMax - c.open) / cRange) * 260;
                    const yC = 10 + ((cMax - c.close) / cRange) * 260;
                    const bull = c.close >= c.open;
                    const clr = bull ? "#00D26A" : "#FF5252";
                    const bW = Math.max(candleW * 0.6, 2);
                    return (
                      <g key={i}>
                        <line x1={cx} x2={cx} y1={yH} y2={yL} stroke={clr} strokeWidth={1} />
                        <rect x={cx - bW / 2} y={Math.min(yO, yC)} width={bW} height={Math.max(Math.abs(yC - yO), 1)} fill={clr} />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
            {/* Time range toggles */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1 flex-1">
                {timeRanges.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 text-[10px] tracking-[0.12em] font-medium transition-all duration-200 ${
                      range === r
                        ? "bg-white text-black"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex border border-white/15">
                {(["LINE", "CANDLE"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-2.5 py-1 text-[9px] tracking-[0.1em] transition-all duration-200 ${
                      chartType === t ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mb-6 md:border md:border-white/8 md:p-6">
            <h3 className="text-[10px] tracking-[0.15em] text-white/40 mb-3">ABOUT</h3>
            <p className="text-[12px] text-white/60 leading-relaxed">{idx.description}</p>
          </div>

          {/* Constituent Stocks */}
          <div className="md:border md:border-white/8 md:p-6">
            <h3 className="text-[10px] tracking-[0.15em] text-white/40 mb-4">
              CONSTITUENTS ({constituents.length})
            </h3>
            <div className="space-y-0">
              {constituents.map((s) => (
                <Link
                  key={s.ticker}
                  href={`/stock/${s.ticker}`}
                  className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.02] transition-colors -mx-1 px-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 border border-white/15 flex items-center justify-center text-[10px] font-[var(--font-anton)] tracking-wider text-white/60 shrink-0">
                      {s.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate">{s.ticker}</p>
                      <p className="text-[9px] text-white/40 truncate">{s.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[11px] font-[var(--font-anton)] tracking-wide">
                      {"\u20B9"}{s.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[9px] font-medium ${s.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - desktop only */}
        <div className="hidden lg:block lg:border-l lg:border-white/8 lg:pl-6">
          {/* Index Stats */}
          <div className="border border-white/8 p-5 mb-4">
            <h3 className="text-[10px] tracking-[0.15em] text-white/40 mb-4">INDEX STATS</h3>
            <div className="space-y-3">
              {[
                { label: "VALUE", val: idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 }) },
                { label: "CHANGE", val: `${idx.change >= 0 ? "+" : ""}${idx.change.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                { label: "CHANGE %", val: `${idx.changePercent >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%` },
                { label: "STOCKS", val: String(constituents.length) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[11px]">
                  <span className="text-white/40">{row.label}</span>
                  <span className="font-medium">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Gainers */}
          {(() => {
            const sorted = [...constituents].sort((a, b) => b.changePercent - a.changePercent);
            const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
            const losers = sorted.filter((s) => s.changePercent < 0).slice(-5).reverse();
            return (
              <>
                {gainers.length > 0 && (
                  <div className="border border-white/8 p-5 mb-4">
                    <h3 className="text-[10px] tracking-[0.15em] text-[#00D26A]/60 mb-3">TOP GAINERS</h3>
                    {gainers.map((s) => (
                      <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex justify-between py-1.5 hover:opacity-70 transition-opacity">
                        <span className="text-[10px]">{s.ticker}</span>
                        <span className="text-[10px] text-[#00D26A]">+{s.changePercent.toFixed(2)}%</span>
                      </Link>
                    ))}
                  </div>
                )}
                {losers.length > 0 && (
                  <div className="border border-white/8 p-5">
                    <h3 className="text-[10px] tracking-[0.15em] text-[#FF5252]/60 mb-3">TOP LOSERS</h3>
                    {losers.map((s) => (
                      <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex justify-between py-1.5 hover:opacity-70 transition-opacity">
                        <span className="text-[10px]">{s.ticker}</span>
                        <span className="text-[10px] text-[#FF5252]">{s.changePercent.toFixed(2)}%</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
