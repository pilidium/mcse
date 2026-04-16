"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { watchlist as mockWatchlist, stockDirectory } from "@/lib/mockData";

export interface Order {
  id: string;
  ticker: string;
  name: string;
  type: "BUY" | "SELL";
  orderType: "DELIVERY" | "INTRADAY";
  pricingType: "MARKET" | "LIMIT";
  qty: number;
  price: number;
  limitPrice?: number;
  total: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  timestamp: number;
}

export interface Position {
  ticker: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  ticker?: string;
  name?: string;
  qty?: number;
  price?: number;
  amount: number;
  balance: number;
  timestamp: number;
  description: string;
}

interface TradingState {
  orders: Order[];
  positions: Position[];
  transactions: Transaction[];
  balance: number;
  watchlistTickers: Set<string>;
  placeOrder: (order: Omit<Order, "id" | "status" | "timestamp" | "total">) => { success: boolean; message: string };
  getOrdersForTicker: (ticker: string) => Order[];
  getBuyCount: (ticker?: string) => number;
  getSellCount: (ticker?: string) => number;
  toggleWatchlist: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
}

const INITIAL_BALANCE = 100000;

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", ticker: "MACAD", name: "MathSoc Academy", type: "BUY", orderType: "DELIVERY", pricingType: "MARKET", qty: 5, price: 1150.00, total: 5750.00, status: "COMPLETED", timestamp: Date.now() - 86400000 * 3 },
  { id: "ORD-002", ticker: "ECLOUD", name: "Enigma Cloud", type: "BUY", orderType: "DELIVERY", pricingType: "MARKET", qty: 3, price: 3180.50, total: 9541.50, status: "COMPLETED", timestamp: Date.now() - 86400000 * 2 },
  { id: "ORD-003", ticker: "CELBIO", name: "Celeste Bio", type: "BUY", orderType: "INTRADAY", pricingType: "MARKET", qty: 10, price: 2090.00, total: 20900.00, status: "COMPLETED", timestamp: Date.now() - 86400000 },
  { id: "ORD-004", ticker: "MACAD", name: "MathSoc Academy", type: "SELL", orderType: "DELIVERY", pricingType: "MARKET", qty: 2, price: 1198.50, total: 2397.00, status: "COMPLETED", timestamp: Date.now() - 43200000 },
  { id: "ORD-005", ticker: "GMAUTO", name: "GM Automotive", type: "BUY", orderType: "DELIVERY", pricingType: "MARKET", qty: 8, price: 1420.00, total: 11360.00, status: "COMPLETED", timestamp: Date.now() - 21600000 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TXN-002", type: "BUY", ticker: "MACAD", name: "MathSoc Academy", qty: 5, price: 1150.00, amount: -5750.00, balance: 94250.00, timestamp: Date.now() - 86400000 * 3, description: "Bought 5 MACAD @ \u20B91,150.00" },
  { id: "TXN-003", type: "BUY", ticker: "ECLOUD", name: "Enigma Cloud", qty: 3, price: 3180.50, amount: -9541.50, balance: 84708.50, timestamp: Date.now() - 86400000 * 2, description: "Bought 3 ECLOUD @ \u20B93,180.50" },
  { id: "TXN-004", type: "BUY", ticker: "CELBIO", name: "Celeste Bio", qty: 10, price: 2090.00, amount: -20900.00, balance: 63808.50, timestamp: Date.now() - 86400000, description: "Bought 10 CELBIO @ \u20B92,090.00" },
  { id: "TXN-005", type: "SELL", ticker: "MACAD", name: "MathSoc Academy", qty: 2, price: 1198.50, amount: 2397.00, balance: 66205.50, timestamp: Date.now() - 43200000, description: "Sold 2 MACAD @ \u20B91,198.50" },
  { id: "TXN-006", type: "BUY", ticker: "GMAUTO", name: "GM Automotive", qty: 8, price: 1420.00, amount: -11360.00, balance: 54845.50, timestamp: Date.now() - 21600000, description: "Bought 8 GMAUTO @ \u20B91,420.00" },
];

const TradingContext = createContext<TradingState>({
  orders: [],
  positions: [],
  transactions: [],
  balance: INITIAL_BALANCE,
  watchlistTickers: new Set(),
  placeOrder: () => ({ success: false, message: "" }),
  getOrdersForTicker: () => [],
  getBuyCount: () => 0,
  getSellCount: () => 0,
  toggleWatchlist: () => {},
  isWatched: () => false,
});

export function TradingProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [watchlistTickers, setWatchlistTickers] = useState<Set<string>>(
    () => new Set(mockWatchlist.map(w => w.ticker))
  );

  // Derive positions from orders
  const positions = useMemo(() => {
    const posMap = new Map<string, { ticker: string; name: string; totalQty: number; totalCost: number }>();
    for (const order of orders) {
      if (order.status !== "COMPLETED") continue;
      const existing = posMap.get(order.ticker) || { ticker: order.ticker, name: order.name, totalQty: 0, totalCost: 0 };
      if (order.type === "BUY") {
        existing.totalCost += order.total;
        existing.totalQty += order.qty;
      } else {
        existing.totalCost -= order.price * order.qty;
        existing.totalQty -= order.qty;
      }
      posMap.set(order.ticker, existing);
    }
    const result: Position[] = [];
    for (const [, pos] of posMap) {
      if (pos.totalQty <= 0) continue;
      const avgPrice = pos.totalCost / pos.totalQty;
      // Read current price from stockDirectory so P&L stays in sync
      const currentPrice = stockDirectory[pos.ticker]?.price ?? avgPrice;
      const pnl = (currentPrice - avgPrice) * pos.totalQty;
      const pnlPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
      result.push({ ticker: pos.ticker, name: pos.name, qty: pos.totalQty, avgPrice, currentPrice, pnl, pnlPercent });
    }
    return result;
  }, [orders]);

  const placeOrder = useCallback((orderInput: Omit<Order, "id" | "status" | "timestamp" | "total">) => {
    const isLimit = orderInput.pricingType === "LIMIT";
    const effectivePrice = isLimit && orderInput.limitPrice ? orderInput.limitPrice : orderInput.price;
    const total = effectivePrice * orderInput.qty;

    if (orderInput.type === "BUY" && total > balance) {
      return { success: false, message: `Insufficient balance. Need \u20B9${Math.round(total).toLocaleString("en-IN")} but have \u20B9${Math.round(balance).toLocaleString("en-IN")}` };
    }

    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      price: effectivePrice,
      total,
      status: "COMPLETED",
      timestamp: Date.now(),
    };

    const newBalance = orderInput.type === "BUY" ? +(balance - total).toFixed(2) : +(balance + total).toFixed(2);

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      type: orderInput.type,
      ticker: orderInput.ticker,
      name: orderInput.name,
      qty: orderInput.qty,
      price: orderInput.price,
      amount: orderInput.type === "BUY" ? -total : total,
      balance: newBalance,
      timestamp: Date.now(),
      description: `${orderInput.type === "BUY" ? "Bought" : "Sold"} ${orderInput.qty} ${orderInput.ticker} @ \u20B9${orderInput.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [newTxn, ...prev]);
    setBalance(newBalance);

    return { success: true, message: `${orderInput.type} order for ${orderInput.qty} ${orderInput.ticker} placed successfully` };
  }, [balance]);

  const getOrdersForTicker = useCallback((ticker: string) => {
    return orders.filter(o => o.ticker === ticker);
  }, [orders]);

  const getBuyCount = useCallback((ticker?: string) => {
    return orders.filter(o => o.type === "BUY" && (!ticker || o.ticker === ticker)).length;
  }, [orders]);

  const getSellCount = useCallback((ticker?: string) => {
    return orders.filter(o => o.type === "SELL" && (!ticker || o.ticker === ticker)).length;
  }, [orders]);

  const toggleWatchlist = useCallback((ticker: string) => {
    setWatchlistTickers(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }, []);

  const isWatched = useCallback((ticker: string) => {
    return watchlistTickers.has(ticker);
  }, [watchlistTickers]);

  const value = useMemo(() => ({
    orders, positions, transactions, balance, watchlistTickers, placeOrder, getOrdersForTicker, getBuyCount, getSellCount, toggleWatchlist, isWatched
  }), [orders, positions, transactions, balance, watchlistTickers, placeOrder, getOrdersForTicker, getBuyCount, getSellCount, toggleWatchlist, isWatched]);

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  return useContext(TradingContext);
}
