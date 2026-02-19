// Trade data from the API
export interface Trade {
  ts_iso: string;
  market_title: string;
  outcome: string;
  side: 'BUY' | 'SELL' | 'buy' | 'sell';
  size: number;
  price: number;
  proxyWallet?: string;
  name?: string;
  pseudonym?: string;
  tx_hash?: string;
}

// Whale trade data
export interface WhaleTrade extends Trade {
  isWhale: true;
}

// Trader aggregated data
export interface Trader {
  name: string;
  total_volume: number;
  trade_count: number;
  top_market?: string;
}

// Market data
export interface Market {
  title: string;
  last_price?: number;
  total_volume?: number;
  buy_count?: number;
  sell_count?: number;
  whale_count?: number;
  volatility_1m?: number;
  outcomes?: Record<string, number>;
}

// Orderflow data per market
export interface OrderflowMarket {
  buy_volume: number;
  sell_volume: number;
  buy_count: number;
  sell_count: number;
  imbalance: number;
  momentum_score: number;
}

// Sentiment calculation result
export interface SentimentData {
  bullishCount: number;
  bearishCount: number;
  totalAnalyzed: number;
  bullishPercent: number;
  bearishPercent: number;
  sentimentScore: number;
}

// Sort state for tables
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// Timeframe filter options
export type TimeframeFilter = '1h' | '6h' | '24h' | 'all';
