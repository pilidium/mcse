"use client";

import Link from "next/link";
import { Calendar, Newspaper } from "lucide-react";
import {
  stockDirectory,
  ipoList,
  newsItems,
  formatRelativeTime,
  type StockInfo,
  type IPO,
  type NewsItem,
} from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

export type SearchFilter = "ALL" | "STOCKS" | "IPO" | "NEWS";
export const SEARCH_FILTERS: SearchFilter[] = ["ALL", "STOCKS", "IPO", "NEWS"];

export type SearchResult =
  | { kind: "stock"; data: StockInfo }
  | { kind: "ipo"; data: IPO }
  | { kind: "news"; data: NewsItem };

const allStocks = Object.values(stockDirectory);

export function computeResults(query: string, filter: SearchFilter): SearchResult[] {
  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  if (!hasQuery && filter === "ALL") return [];

  const matches = (hay: string) => !hasQuery || hay.toLowerCase().includes(q);
  const out: SearchResult[] = [];
  const limit = (n: number) => (filter === "ALL" ? n : 50);

  if (filter === "ALL" || filter === "STOCKS") {
    const stockMatches = allStocks
      .filter((s) => matches(s.ticker) || matches(s.name))
      .slice(0, limit(10));
    for (const s of stockMatches) out.push({ kind: "stock", data: s });
  }

  if (filter === "ALL" || filter === "IPO") {
    const ipoMatches = ipoList
      .filter((i) => matches(i.ticker) || matches(i.name))
      .slice(0, limit(10));
    for (const i of ipoMatches) out.push({ kind: "ipo", data: i });
  }

  if (filter === "ALL" || filter === "NEWS") {
    const newsMatches = newsItems
      .filter((n) => matches(n.headline) || matches(n.ticker) || matches(n.name))
      .slice(0, limit(10));
    for (const n of newsMatches) out.push({ kind: "news", data: n });
  }

  return out;
}

export function sectionCaption(filter: SearchFilter, hasQuery: boolean): string | null {
  if (hasQuery) return null;
  if (filter === "STOCKS") return "ALL STOCKS";
  if (filter === "IPO") return "ALL IPOS";
  if (filter === "NEWS") return "LATEST NEWS";
  return null;
}

export function StockRow({ data: s, onNavigate }: { data: StockInfo; onNavigate: () => void }) {
  return (
    <Link
      href={`/stock/${s.ticker}`}
      onClick={onNavigate}
      className="flex items-center gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] hover:bg-white/[0.04] transition-colors"
    >
      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
        <span className="text-[9px] tracking-[0.1em] text-white/40">{s.ticker.slice(0, 3)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
        <p className="text-[10px] text-white/30 truncate">{s.name}</p>
      </div>
      <div className="shrink-0 mr-2">
        <Sparkline
          data={s.chartData["1D"].map((d) => d.price)}
          width={50}
          height={18}
          positive={s.changePercent >= 0}
        />
      </div>
      <div className="text-right shrink-0 min-w-[70px]">
        <p className="font-[var(--font-anton)] text-[13px]">
          {"\u20B9"}
          {s.price.toLocaleString("en-IN")}
        </p>
        <p
          className={`text-[10px] font-medium ${
            s.changePercent >= 0 ? "text-up" : "text-down"
          }`}
        >
          {s.changePercent >= 0 ? "+" : ""}
          {s.changePercent.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}

export function IpoRow({ data: i, onNavigate }: { data: IPO; onNavigate: () => void }) {
  const statusColor =
    i.status === "LIVE"
      ? "text-up border-up/30"
      : i.status === "UPCOMING"
      ? "text-white/60 border-white/20"
      : "text-white/30 border-white/10";

  return (
    <Link
      href="/ipo"
      onClick={onNavigate}
      className="flex items-center gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] hover:bg-white/[0.04] transition-colors"
    >
      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
        <Calendar size={14} className="text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em] truncate">{i.name}</p>
          <span className="text-[8px] tracking-[0.12em] px-1.5 py-0.5 border border-white/15 text-white/40 shrink-0">
            IPO
          </span>
        </div>
        <p className="text-[10px] text-white/30 truncate">
          {i.dateStart} – {i.dateEnd} · {"\u20B9"}
          {i.priceLow}–{i.priceHigh}
        </p>
      </div>
      <span className={`text-[8px] tracking-[0.12em] px-2 py-1 border shrink-0 ${statusColor}`}>
        {i.status}
      </span>
    </Link>
  );
}

export function NewsRow({ data: n, onNavigate }: { data: NewsItem; onNavigate: () => void }) {
  return (
    <Link
      href={n.ticker ? `/stock/${n.ticker}` : "/news"}
      onClick={onNavigate}
      className="flex items-start gap-4 px-4 py-3.5 border-b border-white/6 active:bg-white/[0.04] hover:bg-white/[0.04] transition-colors"
    >
      <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
        <Newspaper size={14} className="text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-white/80 leading-snug line-clamp-2">{n.headline}</p>
        <div className="flex items-center gap-2 mt-1">
          {n.ticker && (
            <span className="font-[var(--font-anton)] text-[10px] tracking-[0.05em] text-white/50">
              {n.ticker}
            </span>
          )}
          <span className="text-[9px] text-white/25">{formatRelativeTime(n.timestamp)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ResultRow({ result, onNavigate }: { result: SearchResult; onNavigate: () => void }) {
  if (result.kind === "stock") return <StockRow data={result.data} onNavigate={onNavigate} />;
  if (result.kind === "ipo") return <IpoRow data={result.data} onNavigate={onNavigate} />;
  return <NewsRow data={result.data} onNavigate={onNavigate} />;
}

export function resultKey(r: SearchResult): string {
  if (r.kind === "stock") return `stock-${r.data.ticker}`;
  if (r.kind === "ipo") return `ipo-${r.data.ticker}`;
  return `news-${r.data.ticker}-${r.data.timestamp}`;
}
