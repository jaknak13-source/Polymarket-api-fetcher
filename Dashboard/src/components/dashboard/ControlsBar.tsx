import type { TimeframeFilter } from '@/types/polymarket';
import { api } from '@/lib/api';
import { Search, Filter, Download, Clock } from 'lucide-react';

interface ControlsBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sideFilter: string;
  onSideFilterChange: (value: string) => void;
  tradeLimit: number;
  onTradeLimitChange: (value: number) => void;
  timeframe: TimeframeFilter;
  onTimeframeChange: (value: TimeframeFilter) => void;
}

export function ControlsBar({
  searchValue,
  onSearchChange,
  sideFilter,
  onSideFilterChange,
  tradeLimit,
  onTradeLimitChange,
  timeframe,
  onTimeframeChange,
}: ControlsBarProps) {
  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex flex-wrap gap-5 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground uppercase tracking-wider font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            Search Markets & Traders
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Type to filter..."
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Timeframe Filter - NEW */}
        <div className="min-w-[140px]">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground uppercase tracking-wider font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            Timeframe
          </label>
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as TimeframeFilter)}
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Side Filter */}
        <div className="min-w-[140px]">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground uppercase tracking-wider font-semibold mb-2">
            <Filter className="w-3.5 h-3.5" />
            Side Filter
          </label>
          <select
            value={sideFilter}
            onChange={(e) => onSideFilterChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Sides</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>

        {/* Display Limit */}
        <div className="min-w-[140px]">
          <label className="text-xs text-secondary-foreground uppercase tracking-wider font-semibold mb-2 block">
            Display Limit
          </label>
          <select
            value={tradeLimit}
            onChange={(e) => onTradeLimitChange(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value={50}>50 Trades</option>
            <option value={100}>100 Trades</option>
            <option value={200}>200 Trades</option>
            <option value={500}>500 Trades</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="min-w-[200px]">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground uppercase tracking-wider font-semibold mb-2">
            <Download className="w-3.5 h-3.5" />
            Export Data
          </label>
          <div className="flex gap-2">
            <a
              href={api.exportBySizeUrl}
              download
              className="flex-1 px-4 py-3 text-sm font-semibold text-center bg-secondary hover:bg-secondary/80 rounded-xl transition-all hover:-translate-y-0.5"
            >
              📊 By Size
            </a>
            <a
              href={api.exportChronoUrl}
              download
              className="flex-1 px-4 py-3 text-sm font-semibold text-center bg-secondary hover:bg-secondary/80 rounded-xl transition-all hover:-translate-y-0.5"
            >
              ⏱️ Chrono
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
