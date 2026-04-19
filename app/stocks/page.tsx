"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { stockDirectory } from "@/lib/mockData";

const allStocks = Object.values(stockDirectory);

type SortKey = "ticker" | "price" | "changePercent" | "sector";
type SortDir = "asc" | "desc";

export default function StocksPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  const sectors = useMemo(() => {
    const s = new Set(allStocks.map((st) => st.fundamentals.sector));
    return ["ALL", ...Array.from(s).sort()];
  }, []);

  const filtered = useMemo(() => {
    let arr = allStocks;
    if (sectorFilter !== "ALL") arr = arr.filter((s) => s.fundamentals.sector === sectorFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return arr;
  }, [search, sectorFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "sector") { av = a.fundamentals.sector; bv = b.fundamentals.sector; }
      else if (sortKey === "ticker") { av = a.ticker; bv = b.ticker; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "ticker" ? "asc" : "desc"); }
  }

  const renderSortIcon = (col: SortKey) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
    ) : (
      <ChevronDown size={10} className="inline ml-0.5 opacity-30" />
    );

  return (
    <div className="md:pb-12 px-5 md:px-6 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
          ALL STOCKS
        </h1>
        <span className="text-[10px] text-white/30 tracking-[0.1em]">{sorted.length} LISTED</span>
      </div>

      {/* Search + sector filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH BY NAME OR TICKER..."
          className="flex-1 h-11 bg-transparent border border-white/15 px-4 text-[16px] tracking-[0.1em] text-white placeholder:text-white/20 outline-none focus:border-white transition-colors duration-150"
        />
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              className={`px-3 py-2.5 text-[9px] tracking-[0.12em] border-b-2 whitespace-nowrap transition-all duration-150 ${
                sectorFilter === s
                  ? "text-white border-white"
                  : "text-white/40 border-transparent hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden space-y-2">
        {sorted.map((stock) => (
          <div key={stock.ticker}>
            <Link
              href={`/stock/${stock.ticker}`}
              className="flex items-center gap-4 bg-white/[0.02] border border-white/6 p-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                <p className="text-[10px] text-white/40 truncate mt-0.5">{stock.name}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{stock.fundamentals.sector}</p>
              </div>
              <Sparkline data={stock.chartData["1D"].map((d) => d.price)} width={52} height={22} positive={stock.changePercent >= 0} />
              <div className="text-right shrink-0 min-w-[80px]">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[11px] font-medium ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                  {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1fr_100px_120px_80px_100px] gap-4 px-4 py-2 border-b border-white/12">
          <button onClick={() => toggleSort("ticker")} className="text-[9px] tracking-[0.2em] text-white/30 uppercase text-left hover:text-white transition-colors">
            COMPANY {renderSortIcon("ticker")}
          </button>
          <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase text-right">TREND</span>
          <button onClick={() => toggleSort("price")} className="text-[9px] tracking-[0.2em] text-white/30 uppercase text-right hover:text-white transition-colors">
            MKT PRICE {renderSortIcon("price")}
          </button>
          <button onClick={() => toggleSort("changePercent")} className="text-[9px] tracking-[0.2em] text-white/30 uppercase text-right hover:text-white transition-colors">
            CHG % {renderSortIcon("changePercent")}
          </button>
          <button onClick={() => toggleSort("sector")} className="text-[9px] tracking-[0.2em] text-white/30 uppercase text-right hover:text-white transition-colors">
            SECTOR {renderSortIcon("sector")}
          </button>
        </div>
        {sorted.map((stock) => (
          <Link
            key={stock.ticker}
            href={`/stock/${stock.ticker}`}
            className="grid grid-cols-[1fr_100px_120px_80px_100px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
          >
            <div>
              <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{stock.name}</p>
            </div>
            <div className="flex justify-end">
              <Sparkline data={stock.chartData["1D"].map((d) => d.price)} width={80} height={24} positive={stock.changePercent >= 0} />
            </div>
            <div className="text-right">
              <p className="font-[var(--font-anton)] text-[13px]">
                {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[11px] font-medium ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">{stock.fundamentals.sector}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
