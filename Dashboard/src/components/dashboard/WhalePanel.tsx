import type { Trade } from '@/types/polymarket';
import { formatTime, formatNumber, getTraderName } from '@/lib/format';
import { Anchor } from 'lucide-react';

interface WhalePanelProps {
  whales: Trade[];
  error?: string;
}

export function WhalePanel({ whales, error }: WhalePanelProps) {
  const whaleCount = whales.length;
  const totalVolume = whales.reduce((sum, w) => sum + (w.size * w.price), 0);

  return (
    <div className="glass-panel glass-panel-hover p-6">
      <h2 className="text-xl font-bold gradient-text mb-5 pb-4 border-b border-border/50 flex items-center gap-2">
        <Anchor className="w-5 h-5" />
        Whale Activity
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-4 text-sm">
          ⚠️ Error loading whale data: {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-muted/30 p-5 rounded-xl border border-border/50 stat-card">
          <div className="text-3xl font-extrabold gradient-text mb-1">{whaleCount}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Whale Trades Detected</div>
        </div>
        <div className="bg-muted/30 p-5 rounded-xl border border-border/50 stat-card">
          <div className="text-3xl font-extrabold gradient-text mb-1">{formatNumber(totalVolume)}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Whale Volume</div>
        </div>
      </div>

      {/* Whale Table */}
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl">
        <table className="w-full table-striped">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Time
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Market
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Size
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Price
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Trader
              </th>
            </tr>
          </thead>
          <tbody>
            {whales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No whale trades detected
                </td>
              </tr>
            ) : (
              whales.slice(0, 30).map((trade, idx) => (
                <tr key={`whale-${trade.ts_iso}-${idx}`} className="border-b border-border/30">
                  <td className="px-3 py-3 text-sm">{formatTime(trade.ts_iso)}</td>
                  <td className="px-3 py-3 text-sm max-w-[150px] truncate" title={trade.market_title}>
                    {trade.market_title}
                    <span className="whale-badge ml-2">🐋 WHALE</span>
                  </td>
                  <td className="px-3 py-3 text-sm font-bold">{formatNumber(trade.size)}</td>
                  <td className="px-3 py-3 text-sm">{trade.price?.toFixed(4) || '-'}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{getTraderName(trade)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
