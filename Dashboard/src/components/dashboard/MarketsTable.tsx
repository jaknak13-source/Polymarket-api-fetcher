import { useMemo, useState } from 'react';
import type { Market, OrderflowMarket, SortState } from '@/types/polymarket';
import { formatNumber } from '@/lib/format';
import { getMarketSentiment } from '@/lib/sentiment';
import { ArrowUpDown, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketsTableProps {
  markets: Record<string, Market>;
  orderflow: Record<string, OrderflowMarket>;
  searchValue: string;
  error?: string;
  onMarketClick: (marketTitle: string) => void;
}

export function MarketsTable({ markets, orderflow, searchValue, error, onMarketClick }: MarketsTableProps) {
  const [sortState, setSortState] = useState<SortState>({ column: 'total_volume', direction: 'desc' });

  const marketsList = useMemo(() => {
    return Object.entries(markets).map(([title, data]) => ({
      title,
      ...data,
      ...(orderflow[title] || {}),
    }));
  }, [markets, orderflow]);

  const filteredAndSortedMarkets = useMemo(() => {
    let filtered = [...marketsList];

    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter((m) => m.title?.toLowerCase().includes(search));
    }

    filtered.sort((a, b) => {
      const aVal = a[sortState.column as keyof typeof a];
      const bVal = b[sortState.column as keyof typeof b];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = typeof aVal === 'string'
        ? aVal.localeCompare(String(bVal))
        : Number(aVal) - Number(bVal);

      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [marketsList, searchValue, sortState]);

  const handleSort = (column: string) => {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(column)}
      className={`px-3 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors hover:text-primary whitespace-nowrap ${
        sortState.column === column ? 'text-primary' : 'text-secondary-foreground'
      }`}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      </span>
    </th>
  );

  // Sentiment indicator component
  const SentimentIndicator = ({ buyCount, sellCount }: { buyCount?: number; sellCount?: number }) => {
    const sentiment = getMarketSentiment(buyCount || 0, sellCount || 0);
    
    if (sentiment === 'bullish') {
      return (
        <span className="inline-flex items-center gap-1 text-bullish">
          <TrendingUp className="w-4 h-4" />
        </span>
      );
    }
    if (sentiment === 'bearish') {
      return (
        <span className="inline-flex items-center gap-1 text-bearish">
          <TrendingDown className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-neutral opacity-50">
        <Minus className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="glass-panel glass-panel-hover p-6 mb-6">
      <h2 className="text-xl font-bold gradient-text mb-5 pb-4 border-b border-border/50 flex items-center gap-2">
        <BarChart2 className="w-5 h-5" />
        Markets Overview
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-4 text-sm">
          ⚠️ Error loading markets: {error}
        </div>
      )}

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl">
        <table className="w-full table-striped">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <SortableHeader column="title">Market</SortableHeader>
              <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Trend
              </th>
              <SortableHeader column="last_price">Price</SortableHeader>
              <SortableHeader column="total_volume">Volume</SortableHeader>
              <SortableHeader column="buy_count">Buys</SortableHeader>
              <SortableHeader column="sell_count">Sells</SortableHeader>
              <SortableHeader column="whale_count">Whales</SortableHeader>
              <SortableHeader column="volatility_1m">Volatility</SortableHeader>
              <SortableHeader column="imbalance">Imbalance</SortableHeader>
              <SortableHeader column="momentum_score">Momentum</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedMarkets.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                  {Object.keys(markets).length === 0 ? 'Loading markets...' : 'No markets match your search'}
                </td>
              </tr>
            ) : (
              filteredAndSortedMarkets.map((market, idx) => {
                const sentiment = getMarketSentiment(market.buy_count || 0, market.sell_count || 0);
                const rowClass = sentiment === 'bullish' 
                  ? 'market-bullish-indicator' 
                  : sentiment === 'bearish' 
                    ? 'market-bearish-indicator' 
                    : 'market-neutral-indicator';

                return (
                  <tr
                    key={`market-${market.title}-${idx}`}
                    onClick={() => onMarketClick(market.title)}
                    className={`border-b border-border/30 clickable-row ${rowClass}`}
                  >
                    <td className="px-3 py-3 text-sm font-semibold max-w-[200px] truncate" title={market.title}>
                      {market.title}
                    </td>
                    <td className="px-3 py-3">
                      <SentimentIndicator buyCount={market.buy_count} sellCount={market.sell_count} />
                    </td>
                    <td className="px-3 py-3 text-sm">{market.last_price?.toFixed(4) || '-'}</td>
                    <td className="px-3 py-3 text-sm">{formatNumber(market.total_volume || 0)}</td>
                    <td className="px-3 py-3 text-sm font-bold text-bullish">{market.buy_count || 0}</td>
                    <td className="px-3 py-3 text-sm font-bold text-bearish">{market.sell_count || 0}</td>
                    <td className="px-3 py-3 text-sm">{market.whale_count || 0}</td>
                    <td className="px-3 py-3 text-sm">{market.volatility_1m?.toFixed(4) || '-'}</td>
                    <td className="px-3 py-3 text-sm">{market.imbalance?.toFixed(2) || '-'}</td>
                    <td className="px-3 py-3 text-sm">{market.momentum_score?.toFixed(2) || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
