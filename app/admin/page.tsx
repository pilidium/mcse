"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  BarChart3,
  Shield,
  Activity,
  DollarSign,
  AlertTriangle,
  Newspaper,
  Calendar,
  Plus,
  Power,
  Eye,
  EyeOff,
  Megaphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth, type UserRole } from "@/lib/AuthContext";
import { useAdmin } from "@/lib/AdminContext";
import {
  enigmaCompanyData,
  stockDirectory,
  allStocksRaw,
} from "@/lib/mockData";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

/* â”€â”€â”€ Mock platform data (totalAdmin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const platformStats = {
  totalUsers: 248,
  activeToday: 67,
  totalTrades: 1_842,
  totalVolume: 24_87_693,
  listedStocks: 7,
};

const recentUsers = [
  { name: "ARUN KUMAR", email: "arun@mcse.in", role: "user" as UserRole, trades: 34, balance: 12_450, joined: "2025-01-15" },
  { name: "PRIYA SHARMA", email: "priya@mcse.in", role: "user" as UserRole, trades: 21, balance: 8_920, joined: "2025-01-18" },
  { name: "RAHUL VERMA", email: "rahul@mcse.in", role: "company" as UserRole, trades: 15, balance: 45_300, joined: "2025-01-10" },
  { name: "MEENA REDDY", email: "meena@mcse.in", role: "user" as UserRole, trades: 42, balance: 23_100, joined: "2025-01-12" },
  { name: "VIKASH PATEL", email: "vikash@mcse.in", role: "user" as UserRole, trades: 8, balance: 5_200, joined: "2025-01-20" },
  { name: "ANANYA IYER", email: "ananya@mcse.in", role: "user" as UserRole, trades: 19, balance: 15_780, joined: "2025-01-14" },
  { name: "KARTHIK NAIR", email: "karthik@mcse.in", role: "admin" as UserRole, trades: 0, balance: 0, joined: "2025-01-01" },
  { name: "DIVYA JOSHI", email: "divya@mcse.in", role: "user" as UserRole, trades: 27, balance: 18_600, joined: "2025-01-16" },
  { name: "SURESH MENON", email: "suresh@mcse.in", role: "user" as UserRole, trades: 11, balance: 7_340, joined: "2025-01-19" },
  { name: "FATIMA KHAN", email: "fatima@mcse.in", role: "company" as UserRole, trades: 6, balance: 31_500, joined: "2025-01-08" },
];

const activityFeed = [
  { action: "BUY ORDER", detail: "MACAD × 10 @ ₹1,198", time: "2 min ago", color: "text-up" },
  { action: "SELL ORDER", detail: "ECLOUD × 5 @ ₹3,215", time: "8 min ago", color: "text-down" },
  { action: "NEW USER", detail: "vikash@mcse.in registered", time: "15 min ago", color: "text-white/50" },
  { action: "BUY ORDER", detail: "CELBIO × 20 @ ₹2,148", time: "23 min ago", color: "text-up" },
  { action: "SELL ORDER", detail: "INDATA × 15 @ ₹282", time: "45 min ago", color: "text-down" },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Enigma Company Admin Dashboard
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function EnigmaDashboard() {
  const co = enigmaCompanyData;
  const [activeSub, setActiveSub] = useState(co.subsidiaries[0]);
  const sub = stockDirectory[activeSub];
  const fund = sub.fundamentals;
  const chartData = sub.chartData["3D"];
  const { companyNews, companyEvents } = useAdmin();

  const recentNews = companyNews.slice(0, 3);
  const pendingCount = companyNews.filter((n) => n.status === "PENDING").length;
  const upcomingEvents = companyEvents
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <>
      {/* Company Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-white flex items-center justify-center">
            <span className="font-[var(--font-anton)] text-lg md:text-xl tracking-wider">E</span>
          </div>
          <div>
            <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.08em] uppercase">ENIGMA GROUP</h1>
            <p className="text-[10px] text-white/30 tracking-[0.1em] mt-0.5">Enigma Computer Science · COMPANY DASHBOARD</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="font-[var(--font-anton)] text-2xl">{"\u20B9"}{sub.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          <p className={`text-[11px] font-medium ${sub.changePercent >= 0 ? "text-up" : "text-down"}`}>
            {sub.changePercent >= 0 ? "+" : ""}{sub.changePercent.toFixed(2)}%
          </p>
        </div>
      </motion.div>

      {/* Subsidiary Tabs */}
      <div className="flex items-center gap-6 mb-6 overflow-x-auto scrollbar-hide border-b border-white/10">
        {co.subsidiaries.map((ticker) => {
          const s = stockDirectory[ticker];
          const active = ticker === activeSub;
          return (
            <button
              key={ticker}
              onClick={() => setActiveSub(ticker)}
              className={`pb-3 text-[10px] tracking-[0.12em] font-medium whitespace-nowrap transition-colors duration-200 relative ${
                active
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {ticker}
              <span className={`ml-2 text-[9px] ${s.changePercent >= 0 ? "text-up" : "text-down"}`}>
                {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
              </span>
              {active && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />}
            </button>
          );
        })}
      </div>

      {/* Metrics Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/8 mb-8"
      >
        <div className="bg-bg p-4 md:p-5">
          <span className="text-[9px] tracking-[0.15em] text-white/25">SHARES IN CIRCULATION</span>
          <p className="font-[var(--font-anton)] text-lg mt-1">{co.sharesInCirculation.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <span className="text-[9px] tracking-[0.15em] text-white/25">MARKET CAP</span>
          <p className="font-[var(--font-anton)] text-lg mt-1">{fund.marketCap}</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <span className="text-[9px] tracking-[0.15em] text-white/25">VOLUME</span>
          <p className="font-[var(--font-anton)] text-lg mt-1">{fund.volume}</p>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8 space-y-6 md:space-y-0">
        {/* Left column */}
        <div className="space-y-6">
          {/* Stock Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-white/10 p-5"
          >
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-4">STOCK PERFORMANCE · 3D</p>
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="enigmaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sub.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)"} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={sub.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11 }}
                    labelStyle={{ color: "rgba(255,255,255,0.4)" }}
                    itemStyle={{ color: "white" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={sub.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)"}
                    strokeWidth={1.5}
                    fill="url(#enigmaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="border border-white/10 p-5"
          >
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">ABOUT {activeSub}</p>
            <p className="text-[12px] text-white/40 leading-relaxed">{sub.about}</p>
          </motion.div>

          {/* Company News â€” Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-white/10"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Newspaper size={13} className="text-white/30" />
                <p className="text-[9px] tracking-[0.15em] text-white/30">COMPANY NEWS</p>
                {pendingCount > 0 && (
                  <span className="text-[7px] tracking-[0.1em] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5">{pendingCount} PENDING</span>
                )}
              </div>
              <Link href="/admin/news" className="text-[9px] tracking-[0.1em] text-white/40 hover:text-white transition-colors">
                VIEW ALL {"\u2192"}
              </Link>
            </div>
            {recentNews.length > 0 ? recentNews.map((n, i) => (
              <div key={n.id} className={`px-5 py-3.5 ${i < recentNews.length - 1 ? "border-b border-white/6" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[7px] tracking-[0.1em] px-1 py-0.5 border ${
                    n.status === "PENDING" ? "text-amber-400 border-amber-400/20" :
                    n.status === "PUBLISHED" ? "text-up border-up/20" :
                    "text-down border-down/20"
                  }`}>{n.status}</span>
                </div>
                <p className="text-[11px] text-white/60">{n.title}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{new Date(n.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            )) : (
              <div className="px-5 py-6 text-center">
                <p className="text-[10px] text-white/20">No news articles yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Largest Shareholders */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-white/10"
          >
            <div className="px-5 py-4 border-b border-white/8">
              <p className="text-[9px] tracking-[0.15em] text-white/30">LARGEST SHAREHOLDERS</p>
            </div>
            {co.shareholders.map((sh, i) => (
              <div key={sh.name} className={`flex items-center justify-between px-5 py-3 ${i < co.shareholders.length - 1 ? "border-b border-white/6" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/20 w-4">{i + 1}</span>
                  <span className="text-[11px] text-white/60">{sh.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-white/40 font-[var(--font-anton)]">{sh.shares.toLocaleString("en-IN")}</span>
                  <span className="text-[9px] text-white/20 ml-2">{sh.percentage}%</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Events â€” Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="border border-white/10"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-white/30" />
                <p className="text-[9px] tracking-[0.15em] text-white/30">UPCOMING EVENTS</p>
              </div>
              <Link href="/admin/events" className="text-[9px] tracking-[0.1em] text-white/40 hover:text-white transition-colors">
                VIEW ALL {"\u2192"}
              </Link>
            </div>
            {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
              <div key={ev.id} className={`flex items-center justify-between px-5 py-3 ${i < upcomingEvents.length - 1 ? "border-b border-white/6" : ""}`}>
                <div>
                  <p className="text-[11px] text-white/60">{ev.title}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{new Date(ev.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            )) : (
              <div className="px-5 py-6 text-center">
                <p className="text-[10px] text-white/20">No upcoming events</p>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-white/10 p-5"
          >
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">QUICK STATS</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "EPS", val: `₹${fund.eps}` },
                { label: "BOOK VALUE", val: `₹${fund.bookValue.toLocaleString("en-IN")}` },
                { label: "ROE", val: `${fund.roe}%` },
                { label: "VOLUME", val: fund.volume },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[9px] tracking-[0.1em] text-white/20">{s.label}</p>
                  <p className="font-[var(--font-anton)] text-sm mt-0.5">{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Total Admin Dashboard
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TotalAdminDashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { marketOpen, toggleMarket, listedStocks, toggleListing, announcements, addAnnouncement, companyNews, approveNews, rejectNews } = useAdmin();
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const pendingNews = companyNews.filter((n) => n.status === "PENDING");

  function publishAnnouncement() {
    if (!annTitle.trim()) return;
    addAnnouncement(annTitle, annContent);
    setAnnTitle("");
    setAnnContent("");
    setShowAnnForm(false);
  }

  /* ——— USERS TAB ——— */
  if (tab === "users") {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="font-[var(--font-anton)] text-lg tracking-[0.08em]">ALL USERS</h2>
          <p className="text-[10px] text-white/30 mt-0.5">{recentUsers.length} registered · {platformStats.activeToday} active today</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border border-white/10">
          <div className="hidden md:grid grid-cols-[2fr_2fr_80px_80px_100px_80px] gap-4 px-5 py-3 border-b border-white/8">
            <span className="text-[9px] tracking-[0.15em] text-white/25">NAME</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">EMAIL</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">ROLE</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">TRADES</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">BALANCE</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">JOINED</span>
          </div>
          {recentUsers.map((user, i) => (
            <div key={user.email} className={`px-5 py-3.5 ${i < recentUsers.length - 1 ? "border-b border-white/6" : ""}`}>
              <div className="hidden md:grid grid-cols-[2fr_2fr_80px_80px_100px_80px] gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[7px] tracking-wider text-white/40">{user.name.split(" ").map(w => w[0]).join("")}</span>
                  </div>
                  <span className="text-[11px] text-white/60">{user.name}</span>
                </div>
                <span className="text-[10px] text-white/40">{user.email}</span>
                <span className={`text-[8px] tracking-[0.1em] px-1.5 py-0.5 border w-fit ${
                  user.role === "admin" ? "text-amber-400 border-amber-400/20" :
                  user.role === "company" ? "text-blue-400 border-blue-400/20" :
                  "text-white/30 border-white/15"
                }`}>{user.role === "company" ? "CO." : user.role === "admin" ? "ADM" : "USER"}</span>
                <span className="text-[10px] text-white/40">{user.trades}</span>
                <span className="text-[10px] text-white/40">{"\u20B9"}{user.balance.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-white/30">{new Date(user.joined).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
              </div>
              <div className="md:hidden flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[7px] tracking-wider text-white/40">{user.name.split(" ").map(w => w[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.05em] text-white/60">{user.name}</p>
                    <p className="text-[8px] text-white/25">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/40">{user.trades} trades · {"\u20B9"}{user.balance.toLocaleString("en-IN")}</p>
                  <span className={`text-[7px] tracking-[0.1em] px-1 py-0.5 border ${
                    user.role === "admin" ? "text-amber-400 border-amber-400/20" :
                    user.role === "company" ? "text-blue-400 border-blue-400/20" :
                    "text-white/25 border-white/15"
                  }`}>{user.role === "company" ? "CO." : user.role === "admin" ? "ADM" : "USER"}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </>
    );
  }

  /* ——— STOCKS TAB ——— */
  if (tab === "stocks") {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[var(--font-anton)] text-lg tracking-[0.08em]">ALL STOCKS</h2>
            <p className="text-[10px] text-white/30 mt-0.5">{allStocksRaw.length} total · {listedStocks.length} listed</p>
          </div>
          <div className="flex items-center gap-2">
            <Power size={14} className={marketOpen ? "text-up" : "text-down"} />
            <button
              onClick={toggleMarket}
              className={`text-[9px] tracking-[0.1em] font-semibold px-3 py-1.5 border transition-all ${
                marketOpen
                  ? "bg-up/10 border-up/30 text-up hover:bg-up/20"
                  : "bg-down/10 border-down/30 text-down hover:bg-down/20"
              }`}
            >
              {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border border-white/10">
          <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_100px_80px] gap-4 px-5 py-3 border-b border-white/8">
            <span className="text-[9px] tracking-[0.15em] text-white/25">TICKER</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">NAME</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">PRICE</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">CHANGE</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25">PARENT</span>
            <span className="text-[9px] tracking-[0.15em] text-white/25 text-right">STATUS</span>
          </div>
          {allStocksRaw.map((stock, i) => {
            const isListed = listedStocks.includes(stock.ticker);
            return (
              <div key={stock.ticker} className={`px-5 py-3 ${i < allStocksRaw.length - 1 ? "border-b border-white/6" : ""}`}>
                <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_100px_80px] gap-4 items-center">
                  <span className={`text-[11px] tracking-[0.05em] font-medium ${isListed ? "text-white/70" : "text-white/20 line-through"}`}>{stock.ticker}</span>
                  <span className="text-[10px] text-white/40">{stock.name}</span>
                  <span className="text-[11px] text-white/60">{"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  <span className={`text-[10px] ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[9px] text-white/25">{stock.parentCompany || "\u2014"}</span>
                  <button
                    onClick={() => toggleListing(stock.ticker)}
                    className={`flex items-center justify-end gap-1.5 text-[9px] tracking-[0.1em] px-2.5 py-1 border transition-all w-fit ml-auto ${
                      isListed ? "text-up border-up/20 hover:border-up/50" : "text-down border-down/20 hover:border-down/50"
                    }`}
                  >
                    {isListed ? <Eye size={11} /> : <EyeOff size={11} />}
                    {isListed ? "LISTED" : "DELISTED"}
                  </button>
                </div>
                <div className="md:hidden flex items-center justify-between">
                  <div>
                    <p className={`text-[11px] tracking-[0.05em] ${isListed ? "text-white/60" : "text-white/20 line-through"}`}>{stock.ticker}</p>
                    <p className="text-[9px] text-white/25">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => toggleListing(stock.ticker)}
                    className={`flex items-center gap-1.5 text-[9px] tracking-[0.1em] px-2.5 py-1 border transition-all ${
                      isListed ? "text-up border-up/20 hover:border-up/50" : "text-down border-down/20 hover:border-down/50"
                    }`}
                  >
                    {isListed ? <Eye size={11} /> : <EyeOff size={11} />}
                    {isListed ? "LISTED" : "DELISTED"}
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </>
    );
  }

  /* ——— DASHBOARD (default) ——— */
  const displayedUsers = recentUsers.slice(0, 3);
  const displayedStocks = allStocksRaw.slice(0, 5);
  const displayedActivity = showAllActivity ? activityFeed : activityFeed.slice(0, 3);

  return (
    <>
      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-[1px] bg-white/8 mb-8"
      >
        <div className="bg-bg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.15em] text-white/25">TOTAL USERS</span>
          </div>
          <p className="font-[var(--font-anton)] text-xl">{platformStats.totalUsers}</p>
          <p className="text-[10px] text-up mt-0.5">{platformStats.activeToday} active</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.15em] text-white/25">TRADES</span>
          </div>
          <p className="font-[var(--font-anton)] text-xl">{platformStats.totalTrades.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.15em] text-white/25">VOLUME</span>
          </div>
          <p className="font-[var(--font-anton)] text-xl">{"\u20B9"}{platformStats.totalVolume.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.15em] text-white/25">LISTED</span>
          </div>
          <p className="font-[var(--font-anton)] text-xl">{listedStocks.length}</p>
        </div>
        <div className="bg-bg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Power size={13} className={marketOpen ? "text-up" : "text-down"} />
            <span className="text-[9px] tracking-[0.15em] text-white/25">MARKET</span>
          </div>
          <p className={`font-[var(--font-anton)] text-xl ${marketOpen ? "text-up" : "text-down"}`}>
            {marketOpen ? "OPEN" : "CLOSED"}
          </p>
        </div>
      </motion.div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Users */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border border-white/10"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <p className="text-[9px] tracking-[0.15em] text-white/30">USERS</p>
            <Link href="/admin?tab=users" className="text-[9px] tracking-[0.1em] text-white/30 hover:text-white transition-colors">SEE ALL {"\u2192"}</Link>
          </div>
          {displayedUsers.map((user, i) => (
            <div
              key={user.email}
              className={`flex items-center justify-between px-5 py-3 ${
                i < displayedUsers.length - 1 ? "border-b border-white/6" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-[7px] tracking-wider text-white/40">{user.name.split(" ").map(w => w[0]).join("")}</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.05em] text-white/60">{user.name}</p>
                  <p className="text-[8px] text-white/25">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/40">{user.trades} trades</p>
                {user.role !== "user" && (
                  <span className="text-[7px] tracking-[0.1em] text-white/25 border border-white/15 px-1 py-0.5">
                    {user.role === "company" ? "CO." : "ADM"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Col 2: Market Controls */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Market Status Toggle */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">MARKET STATUS</p>
            <button
              onClick={toggleMarket}
              className={`w-full py-3 text-[10px] tracking-[0.15em] font-semibold border transition-all ${
                marketOpen
                  ? "bg-up/10 border-up/30 text-up hover:bg-up/20"
                  : "bg-down/10 border-down/30 text-down hover:bg-down/20"
              }`}
            >
              <Power size={14} className="inline mr-2 -mt-0.5" />
              {marketOpen ? "MARKET IS OPEN · CLICK TO CLOSE" : "MARKET IS CLOSED · CLICK TO OPEN"}
            </button>
          </div>

          {/* Listed Stocks */}
          <div className="border border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <p className="text-[9px] tracking-[0.15em] text-white/30">LISTED STOCKS</p>
              <Link href="/admin?tab=stocks" className="text-[9px] tracking-[0.1em] text-white/30 hover:text-white transition-colors">SEE ALL {"\u2192"}</Link>
            </div>
            {displayedStocks.map((stock, i) => {
              const isListed = listedStocks.includes(stock.ticker);
              return (
                <div
                  key={stock.ticker}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < displayedStocks.length - 1 ? "border-b border-white/6" : ""
                  }`}
                >
                  <div>
                    <p className={`text-[11px] tracking-[0.05em] ${isListed ? "text-white/60" : "text-white/20 line-through"}`}>{stock.ticker}</p>
                    <p className="text-[9px] text-white/25">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => toggleListing(stock.ticker)}
                    className={`flex items-center gap-1.5 text-[9px] tracking-[0.1em] px-2.5 py-1 border transition-all ${
                      isListed
                        ? "text-up border-up/20 hover:border-up/50"
                        : "text-down border-down/20 hover:border-down/50"
                    }`}
                  >
                    {isListed ? <Eye size={11} /> : <EyeOff size={11} />}
                    {isListed ? "LISTED" : "DELISTED"}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Col 3: Activity Feed + Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Activity Feed */}
          <div className="border border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <p className="text-[9px] tracking-[0.15em] text-white/30">RECENT ACTIVITY</p>
              {activityFeed.length > 3 && (
                <button onClick={() => setShowAllActivity(!showAllActivity)} className="flex items-center gap-1 text-[9px] tracking-[0.1em] text-white/30 hover:text-white transition-colors">
                  {showAllActivity ? <><ChevronUp size={11} /> LESS</> : <><ChevronDown size={11} /> MORE</>}
                </button>
              )}
            </div>
            {displayedActivity.map((item, i) => (
              <div
                key={i}
                className={`px-5 py-3 ${i < displayedActivity.length - 1 ? "border-b border-white/6" : ""}`}
              >
                <span className={`text-[9px] tracking-[0.1em] font-semibold ${item.color}`}>{item.action}</span>
                <p className="text-[10px] text-white/40 mt-0.5">{item.detail}</p>
                <p className="text-[8px] text-white/15 mt-0.5">{item.time}</p>
              </div>
            ))}
          </div>

          {/* Announcements */}
          <div className="border border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Megaphone size={13} className="text-white/30" />
                <p className="text-[9px] tracking-[0.15em] text-white/30">ANNOUNCEMENTS</p>
              </div>
              <button
                onClick={() => setShowAnnForm(!showAnnForm)}
                className="flex items-center gap-1.5 text-[9px] tracking-[0.1em] text-white/40 hover:text-white transition-colors"
              >
                <Plus size={12} /> NEW
              </button>
            </div>
            {showAnnForm && (
              <div className="px-5 py-4 border-b border-white/8 space-y-3">
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20"
                />
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Content..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 resize-none"
                />
                <button
                  onClick={publishAnnouncement}
                  className="px-4 py-2 bg-white text-black text-[10px] tracking-[0.1em] font-semibold hover:bg-white/90 transition-colors"
                >
                  PUBLISH
                </button>
              </div>
            )}
            {announcements.map((a, i) => (
              <div key={a.id} className={`px-5 py-3 ${i < announcements.length - 1 ? "border-b border-white/6" : ""}`}>
                <p className="text-[11px] text-white/60">{a.title}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{a.content}</p>
                <p className="text-[8px] text-white/15 mt-1">{new Date(a.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pending News Approvals */}
      {pendingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-8 border border-white/10"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Newspaper size={13} className="text-amber-400/50" />
              <p className="text-[9px] tracking-[0.15em] text-amber-400/60">PENDING NEWS APPROVAL ({pendingNews.length})</p>
            </div>
            <Link href="/admin/news" className="text-[9px] tracking-[0.1em] text-white/40 hover:text-white transition-colors">
              VIEW ALL {"\u2192"}
            </Link>
          </div>
          {pendingNews.map((n) => (
            <div key={n.id} className="flex items-center justify-between px-5 py-3 border-b border-white/6 last:border-b-0">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] tracking-[0.1em] text-white/20">{n.company}</span>
                </div>
                <p className="text-[11px] text-white/60">{n.title}</p>
                <p className="text-[9px] text-white/25 mt-0.5">{new Date(n.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => approveNews(n.id)}
                  className="h-7 px-3 text-[8px] tracking-[0.1em] bg-up text-black font-semibold hover:bg-up/80 transition-colors"
                >
                  APPROVE
                </button>
                <button
                  onClick={() => rejectNews(n.id)}
                  className="h-7 px-3 text-[8px] tracking-[0.1em] border border-down/40 text-down hover:bg-down/10 transition-colors"
                >
                  REJECT
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Main Admin Page
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function AdminPage() {
  const { isLoggedIn, role, userName } = useAuth();

  if (!isLoggedIn || !role || role === "user") {
    return (
      <div className="pb-24 md:pb-12 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <AlertTriangle size={32} className="text-white/20 mb-4" />
          <p className="font-[var(--font-anton)] text-lg tracking-[0.1em] mb-2">ACCESS DENIED</p>
          <p className="text-[11px] text-white/40 mb-6">You need admin privileges to access this page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 py-6 md:py-8">
      {/* Header (totalAdmin only â€” companyAdmin has its own header) */}
      {role === "admin" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <Shield size={18} className="text-white/40" />
          <div>
            <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.08em] uppercase">ADMIN DASHBOARD</h1>
            <p className="text-[10px] text-white/30 mt-0.5">Logged in as {userName}</p>
          </div>
        </motion.div>
      )}

      {role === "company" ? <EnigmaDashboard /> : <Suspense><TotalAdminDashboard /></Suspense>}
    </div>
  );
}
