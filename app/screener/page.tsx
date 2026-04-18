"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, ArrowLeft, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { allStocksEnriched } from "@/lib/mockData";

type SortKey = "ticker" | "price" | "change" | "volume";
type SortDir = "asc" | "desc";

const sectors = ["ALL", ...Array.from(new Set(allStocksEnriched.map((s) => s.sector)))];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "ticker", label: "NAME" },
  { key: "price", label: "PRICE" },
  { key: "change", label: "CHANGE %" },
  { key: "volume", label: "VOLUME" },
];

export default function ScreenerPage() {
  const router = useRouter();
  const [sector, setSector] = useState("ALL");
  const [minChange, setMinChange] = useState(-10);
  const [maxChange, setMaxChange] = useState(10);
  const [minPrice, setMinPrice] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("change");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileValue, setMobileValue] = useState<"price" | "dayChangePercent" | "volume">("price");

  const filtered = useMemo(() => {
    return allStocksEnriched
      .filter((s) => sector === "ALL" || s.sector === sector)
      .filter((s) => s.dayChangePercent >= minChange && s.dayChangePercent <= maxChange)
      .filter((s) => s.price >= minPrice)
      .sort((a, b) => {
        let av: number, bv: number;
        switch (sortKey) {
          case "ticker": return sortDir === "asc" ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker);
          case "price": av = a.price; bv = b.price; break;
          case "change": av = a.dayChangePercent; bv = b.dayChangePercent; break;
          case "volume": av = a.volume; bv = b.volume; break;
          default: av = 0; bv = 0;
        }
        return sortDir === "asc" ? av - bv : bv - av;
      });
  }, [sector, minChange, maxChange, minPrice, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const renderSortIcon = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const avgChange = filtered.length ? (filtered.reduce((s, x) => s + x.dayChangePercent, 0) / filtered.length) : 0;

  return (
    <div className="py-6 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">SCREENER</h1>
            <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">INTRADAY SCANNER</p>
          </div>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="px-4 py-2.5 text-[10px] tracking-[0.15em] border border-white/15 text-white/40 hover:text-white hover:border-white transition-all duration-150 flex items-center gap-1.5"
        >
          <SlidersHorizontal size={12} />
          FILTERS
        </button>
      </div>

      {/* Inline stats bar */}
      <div className="flex items-center gap-4 mb-4 border border-white/6 p-3 px-4">
        <span className="text-[10px] tracking-[0.15em] text-white/40">
          <span className="font-[var(--font-anton)] text-base text-white mr-1.5">{filtered.length}</span>STOCKS MATCHING
        </span>
        <span className="text-white/10">&middot;</span>
        <span className="text-[10px] tracking-[0.1em] text-white/30">
          AVG CHG <span className={`font-medium ml-1 ${avgChange >= 0 ? "text-up" : "text-down"}`}>{avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%</span>
        </span>
      </div>

      {/* Sector pills — always visible */}
      <div className="flex flex-wrap gap-0 mb-4">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`px-3 py-2 text-[9px] tracking-[0.1em] border-b-2 transition-all duration-150 ${
              sector === s
                ? "text-white border-white"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Collapsible numeric filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden mb-4"
          >
            <div className="border border-white/8 p-4 flex flex-wrap gap-6 items-end">
              <div>
                <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">CHANGE % RANGE</p>
                <div className="flex items-center gap-2">
                  <input type="number" value={minChange} onChange={(e) => setMinChange(Number(e.target.value))}
                    className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                  <span className="text-white/20 text-[10px]">to</span>
                  <input type="number" value={maxChange} onChange={(e) => setMaxChange(Number(e.target.value))}
                    className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                </div>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">MIN PRICE</p>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-20 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center ml-auto"
              >
                <X size={14} className="text-white/30" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 px-4 py-2 border-b border-white/8 text-[9px] tracking-[0.15em] text-white/30">
          <button onClick={() => toggleSort("ticker")} className="flex items-center gap-1 text-left hover:text-white transition-colors">TICKER {renderSortIcon("ticker")}</button>
          <button onClick={() => toggleSort("price")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">PRICE {renderSortIcon("price")}</button>
          <button onClick={() => toggleSort("change")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">CHG% {renderSortIcon("change")}</button>
          <button onClick={() => toggleSort("volume")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">VOL {renderSortIcon("volume")}</button>
          <span className="text-right">TREND</span>
        </div>
        {filtered.map((s) => (
          <Link key={s.ticker} href={`/stock/${s.ticker}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 px-4 py-3 border-b border-white/4 hover:bg-white/[0.02] transition-colors items-center"
            >
              <div>
                <span className="font-[var(--font-anton)] text-[12px]">{s.ticker}</span>
                <span className="text-[10px] text-white/25 ml-2">{s.sector}</span>
              </div>
              <span className="text-[12px] text-right">{"\u20B9"}{s.price.toFixed(2)}</span>
              <span className={`text-[11px] text-right font-medium px-2 py-0.5 ${
                s.dayChangePercent >= 0
                  ? "text-up bg-up/5"
                  : "text-down bg-down/5"
              }`}>
                {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-right text-white/40">{(s.volume / 1000).toFixed(0)}K</span>
              <div className="flex items-center justify-end">
                <Sparkline data={s.sparkline} width={60} height={20} positive={s.dayChangePercent >= 0} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center gap-3 mb-3 relative">
          <button
            onClick={() => setMobileSortOpen(!mobileSortOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-[10px] tracking-[0.1em] text-white/60 hover:text-white hover:border-white transition-colors"
          >
            <ArrowUpDown size={11} />
            SORT
          </button>
          {mobileSortOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 border border-white/15 bg-bg min-w-[140px] shadow-xl">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSortKey(opt.key); setSortDir("desc"); setMobileSortOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] transition-colors ${
                    sortKey === opt.key ? "text-white bg-white/5" : "text-white/40 hover:bg-white/[0.03]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[9px] tracking-[0.1em] text-white/25">VALUE</span>
            <button
              onClick={() => setMobileValue((v) => {
                const order: typeof v[] = ["price", "dayChangePercent", "volume"];
                return order[(order.indexOf(v) + 1) % order.length];
              })}
              className="px-3 py-1.5 border border-white/15 text-[10px] tracking-[0.1em] text-white/50 hover:text-white hover:border-white transition-all"
            >
              {{ price: "PRICE", dayChangePercent: "CHG%", volume: "VOL" }[mobileValue]}
            </button>
          </div>
        </div>
        {filtered.map((s) => (
          <Link key={s.ticker} href={`/stock/${s.ticker}`}>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
                <p className="text-[10px] text-white/30">{s.sector}</p>
              </div>
              <Sparkline data={s.sparkline} width={44} height={18} positive={s.dayChangePercent >= 0} />
              <div className="text-right shrink-0 min-w-[70px]">
                {mobileValue === "price" && (
                  <>
                    <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{s.price.toFixed(2)}</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </>
                )}
                {mobileValue === "dayChangePercent" && (
                  <>
                    <p className={`font-[var(--font-anton)] text-[13px] ${s.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                    <p className="text-[10px] text-white/30">{"\u20B9"}{s.price.toFixed(2)}</p>
                  </>
                )}
                {mobileValue === "volume" && (
                  <>
                    <p className="font-[var(--font-anton)] text-[13px]">{(s.volume / 1000).toFixed(0)}K</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
