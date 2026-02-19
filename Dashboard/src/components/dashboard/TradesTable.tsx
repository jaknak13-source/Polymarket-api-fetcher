import { useMemo, useState } from 'react';
import type { Trade, SortState } from '@/types/polymarket';
import { formatTime, formatNumber, shortenHash, getTraderName } from '@/lib/format';
import { ArrowUpDown, TrendingUp } from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
  searchValue: string;
  sideFilter: string;
  limit: number;
  error?: string;
}

export function TradesTable({ trades, searchValue, sideFilter, limit, error }: TradesTableProps) {
  const [sortState, setSortState] = useState<SortState>({ column: 'ts_iso', direction: 'desc' });

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = [...trades];

    // Apply search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (trade) =>
          trade.market_title?.toLowerCase().includes(search) ||
          trade.name?.toLowerCase().includes(search) ||
          trade.pseudonym?.toLowerCase().includes(search) ||
          trade.proxyWallet?.toLowerCase().includes(search)
      );
    }

    // Apply side filter
    if (sideFilter !== 'all') {
      filtered = filtered.filter(
        (trade) => trade.side?.toLowerCase() === sideFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortState.column as keyof Trade];
      const bVal = b[sortState.column as keyof Trade];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = typeof aVal === 'string' 
        ? aVal.localeCompare(String(bVal))
        : Number(aVal) - Number(bVal);

      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return filtered.slice(0, limit);
  }, [trades, searchValue, sideFilter, limit, sortState]);

  const handleSort = (column: string) => {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(column)}
      className={`px-3 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${
        sortState.column === column ? 'text-primary' : 'text-secondary-foreground'
      }`}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      </span>
    </th>
  );

  return (
    <div className="glass-panel glass-panel-hover p-6 mb-6">
      <h2 className="text-xl font-bold gradient-text mb-5 pb-4 border-b border-border/50 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Recent Trades
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-4 text-sm">
          ⚠️ Error loading trades: {error}
        </div>
      )}

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl">
        <table className="w-full table-striped">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <SortableHeader column="ts_iso">Time</SortableHeader>
              <SortableHeader column="market_title">Market</SortableHeader>
              <SortableHeader column="outcome">Outcome</SortableHeader>
              <SortableHeader column="side">Side</SortableHeader>
              <SortableHeader column="size">Size</SortableHeader>
              <SortableHeader column="price">Price</SortableHeader>
              <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Trader
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  {trades.length === 0 ? 'Loading trades...' : 'No trades match your filters'}
                </td>
              </tr>
            ) : (
              filteredAndSortedTrades.map((trade, idx) => (
                <tr key={`${trade.ts_iso}-${idx}`} className="border-b border-border/30 transition-colors">
                  <td className="px-3 py-3 text-sm">{formatTime(trade.ts_iso)}</td>
                  <td className="px-3 py-3 text-sm max-w-[200px] truncate" title={trade.market_title}>
                    {trade.market_title}
                  </td>
                  <td className="px-3 py-3 text-sm font-medium">
                    <span className={trade.outcome?.toUpperCase() === 'YES' ? 'text-bullish' : 'text-bearish'}>
                      {trade.outcome}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-bold">
                    <span className={trade.side?.toUpperCase() === 'BUY' ? 'text-bullish' : 'text-bearish'}>
                      {trade.side?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold">{formatNumber(trade.size)}</td>
                  <td className="px-3 py-3 text-sm">{trade.price?.toFixed(4) || '-'}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{getTraderName(trade)}</td>
                  <td className="px-3 py-3 text-sm font-mono text-primary/70">{shortenHash(trade.tx_hash)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
