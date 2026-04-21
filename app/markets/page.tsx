"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronUp, Activity, ArrowUpDown } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import {
  indices,
  allStocksEnriched,
  marketBreadth as mockMarketBreadth,
} from "@/lib/mockData";
import { getMarketBreadth, getStocks, MarketBreadth } from "@/lib/api";

const sectors = ["ALL", ...Array.from(new Set(allStocksEnriched.map((s) => s.sector)))];

type SortKey = "ticker" | "price" | "dayChangePercent" | "pe" | "volume" | "sector";
type SortDir = "asc" | "desc";

type MobileValueKey = "price" | "dayChangePercent" | "volume" | "pe";
const mobileValueLabels: Record<MobileValueKey, string> = {
  price: "PRICE",
  dayChangePercent: "CHG%",
  volume: "VOL",
  pe: "P/E",
};

export default function MarketsPage() {
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("dayChangePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [mobileSort, setMobileSort] = useState<SortKey>("dayChangePercent");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileValue, setMobileValue] = useState<MobileValueKey>("dayChangePercent");
  const [marketBreadth, setMarketBreadth] = useState<MarketBreadth>(mockMarketBreadth);
  const [stocks, setStocks] = useState(allStocksEnriched);

  useEffect(() => {
    getMarketBreadth().then(res => {
      if (res.data) setMarketBreadth(res.data);
    });
    getStocks().then(res => {
      if (!res.data || res.data.length === 0) return;
      const priceMap: Record<string, number> = {};
      for (const s of res.data) if (s.price !== null) priceMap[s.ticker] = s.price;
      setStocks(allStocksEnriched.map(s => ({
        ...s,
        price: priceMap[s.ticker] ?? s.price,
      })));
    });
  }, []);

  const totalBreadth = marketBreadth.advances + marketBreadth.declines + marketBreadth.unchanged;
  const advPct = ((marketBreadth.advances / totalBreadth) * 100).toFixed(1);
  const decPct = ((marketBreadth.declines / totalBreadth) * 100).toFixed(1);

  const filtered = useMemo(() => {
    const list = sectorFilter === "ALL" ? [...stocks] : stocks.filter((s) => s.sector === sectorFilter);
    const key = sortKey;
    list.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (key === "ticker") { av = a.ticker; bv = b.ticker; }
      else if (key === "sector") { av = a.sector; bv = b.sector; }
      else { av = a[key]; bv = b[key]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [stocks, sectorFilter, sortKey, sortDir]);

  const mobileFiltered = useMemo(() => {
    const list = sectorFilter === "ALL" ? [...stocks] : stocks.filter((s) => s.sector === sectorFilter);
    list.sort((a, b) => {
      const key = mobileSort;
      let av: string | number, bv: string | number;
      if (key === "ticker") { av = a.ticker; bv = b.ticker; }
      else if (key === "sector") { av = a.sector; bv = b.sector; }
      else { av = a[key]; bv = b[key]; }
      if (typeof av === "string") return av.localeCompare(bv as string);
      return (bv as number) - (av as number);
    });
    return list;
  }, [stocks, sectorFilter, mobileSort]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function sortIcon(col: SortKey) {
    return sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />;
  }

  function formatMobileValue(stock: typeof allStocksEnriched[0]) {
    switch (mobileValue) {
      case "price": return <span className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>;
      case "dayChangePercent": return <span className={`text-[12px] font-medium ${stock.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>{stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%</span>;
      case "volume": return <span className="text-[12px] text-white/50">{(stock.volume / 1_000_000).toFixed(1)}M</span>;
      case "pe": return <span className="text-[12px] text-white/50">{stock.pe.toFixed(1)}</span>;
    }
  }

  return (
    <div className="py-6 md:py-8 md:pb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.1em] uppercase">MARKETS</h1>
          <p className="text-[10px] tracking-[0.15em] text-white/30 mt-1">{stocks.length} STOCKS</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-up animate-pulse" />
          <span className="text-[9px] tracking-[0.12em] text-white/30">MARKET OPEN</span>
        </div>
      </div>

      {/* Indices tiles */}
      <section className="mb-8">
        <div className="grid gap-[1px] bg-white/8 grid-cols-2 md:grid-cols-4">
          {indices.map((idx, i) => (
            <Link key={idx.name} href={`/index/${idx.slug}`}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-bg p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[8px] tracking-[0.15em] text-white/30 uppercase">{idx.name}</p>
                <Sparkline data={idx.sparkline} width={36} height={12} positive={idx.changePercent >= 0} />
              </div>
              <p className="font-[var(--font-anton)] text-[15px] tracking-tight mb-0.5">
                {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-[10px] font-medium ${idx.changePercent >= 0 ? "text-up" : "text-down"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%)
              </p>
            </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Market Breadth */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-white/30" />
          <h2 className="text-[9px] tracking-[0.2em] text-white/30 uppercase">MARKET BREADTH</h2>
        </div>
        <div className="flex h-2 w-full overflow-hidden">
          <div className="bg-up transition-all" style={{ width: `${advPct}%` }} />
          <div className="bg-white/15 transition-all" style={{ width: `${((marketBreadth.unchanged / totalBreadth) * 100).toFixed(1)}%` }} />
          <div className="bg-down transition-all" style={{ width: `${decPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-up">{marketBreadth.advances} advances ({advPct}%)</span>
          <span className="text-[9px] text-white/25">{marketBreadth.unchanged} unchanged</span>
          <span className="text-[9px] text-down">{marketBreadth.declines} declines ({decPct}%)</span>
        </div>
      </motion.section>

      {/* Sector filter tabs */}
      <div className="flex items-center gap-0 mb-6 border-b border-white/8 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={`px-4 py-3 text-[10px] tracking-[0.12em] border-b-2 transition-colors whitespace-nowrap ${
              sectorFilter === s ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Desktop: full sortable table */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[2fr_80px_110px_80px_70px_70px_70px_100px] gap-3 px-4 py-2 border-b border-white/12">
          <button onClick={() => toggleSort("ticker")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-left hover:text-white transition-colors">
            COMPANY {sortIcon("ticker")}
          </button>
          <span className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-center">CHART</span>
          <button onClick={() => toggleSort("price")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-right hover:text-white transition-colors">
            PRICE {sortIcon("price")}
          </button>
          <button onClick={() => toggleSort("dayChangePercent")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-right hover:text-white transition-colors">
            CHG% {sortIcon("dayChangePercent")}
          </button>
          <button onClick={() => toggleSort("volume")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-right hover:text-white transition-colors">
            VOL {sortIcon("volume")}
          </button>
          <button onClick={() => toggleSort("pe")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-right hover:text-white transition-colors">
            P/E {sortIcon("pe")}
          </button>
          <button onClick={() => toggleSort("sector")} className="text-[8px] tracking-[0.15em] text-white/30 uppercase text-right hover:text-white transition-colors">
            SECTOR {sortIcon("sector")}
          </button>
          <span />
        </div>

        {filtered.map((stock, i) => (
          <motion.div
            key={stock.ticker}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <Link
              href={`/stock/${stock.ticker}`}
              className="grid grid-cols-[2fr_80px_110px_80px_70px_70px_70px_100px] gap-3 items-center px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors"
            >
              <div className="min-w-0">
                <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{stock.ticker}</p>
                <p className="text-[9px] text-white/30 truncate">{stock.name}</p>
              </div>
              <div className="flex justify-center">
                <Sparkline data={stock.sparkline} width={56} height={18} positive={stock.dayChangePercent >= 0} />
              </div>
              <p className="font-[var(--font-anton)] text-[12px] text-right">
                {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-[10px] font-medium text-right ${stock.dayChangePercent >= 0 ? "text-up" : "text-down"}`}>
                {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
              </p>
              <p className="text-[10px] text-white/40 text-right">{(stock.volume / 1_000_000).toFixed(1)}M</p>
              <p className="text-[10px] text-white/40 text-right">{stock.pe.toFixed(1)}</p>
              <p className="text-[9px] text-white/25 text-right">{stock.sector}</p>
              <span />
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="text-[11px] text-white/25 py-16 text-center tracking-[0.1em]">NO STOCKS IN THIS SECTOR</p>
        )}
      </div>

      {/* Mobile: card view with sort + tappable value */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4 relative">
          <button
            onClick={() => setMobileSortOpen(!mobileSortOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-[10px] tracking-[0.1em] text-white/60 hover:text-white hover:border-white transition-colors"
          >
            <ArrowUpDown size={11} />
            SORT
          </button>
          {mobileSortOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 border border-white/15 bg-bg min-w-[140px]">
              {(["ticker", "price", "dayChangePercent", "volume", "pe"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setMobileSort(key); setMobileSortOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] transition-colors ${mobileSort === key ? "text-white bg-white/[0.06]" : "text-white/50 hover:text-white hover:bg-white/[0.03]"}`}
                >
                  {{ ticker: "NAME", price: "PRICE", dayChangePercent: "CHANGE %", volume: "VOLUME", pe: "P/E", sector: "SECTOR" }[key]}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-0">
            {(Object.keys(mobileValueLabels) as MobileValueKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setMobileValue(key)}
                className={`px-2.5 py-1 text-[9px] tracking-[0.1em] transition-colors ${mobileValue === key ? "text-white" : "text-white/30"}`}
              >
                {mobileValueLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {mobileFiltered.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="flex items-center gap-4 bg-white/[0.02] border border-white/6 p-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                <p className="text-[10px] text-white/40 truncate mt-0.5">{stock.name}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{stock.sector}</p>
              </div>
              <Sparkline data={stock.sparkline} width={48} height={18} positive={stock.dayChangePercent >= 0} />
              <div className="text-right shrink-0 min-w-[70px]">
                {formatMobileValue(stock)}
              </div>
            </Link>
          ))}
        </div>

        {mobileFiltered.length === 0 && (
          <p className="text-[11px] text-white/25 py-16 text-center tracking-[0.1em]">NO STOCKS IN THIS SECTOR</p>
        )}
      </div>
    </div>
  );
}