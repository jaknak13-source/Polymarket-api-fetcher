import { useMemo, useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Trader, SortState } from '@/types/polymarket';
import { formatNumber } from '@/lib/format';
import { ArrowUpDown, Crown } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TradersPanelProps {
  traders: Trader[];
  error?: string;
}

export function TradersPanel({ traders, error }: TradersPanelProps) {
  const [searchValue, setSearchValue] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: 'total_volume', direction: 'desc' });

  const filteredAndSortedTraders = useMemo(() => {
    let filtered = [...traders];

    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter((t) => t.name?.toLowerCase().includes(search));
    }

    filtered.sort((a, b) => {
      const aVal = a[sortState.column as keyof Trader];
      const bVal = b[sortState.column as keyof Trader];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = typeof aVal === 'string'
        ? aVal.localeCompare(String(bVal))
        : Number(aVal) - Number(bVal);

      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [traders, searchValue, sortState]);

  const handleSort = (column: string) => {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Chart data
  const chartData = useMemo(() => {
    const top10 = traders.slice(0, 10);
    return {
      labels: top10.map((t) => (t.name?.length > 15 ? t.name.substring(0, 15) + '...' : t.name || 'Unknown')),
      datasets: [
        {
          label: 'Total Volume (USD)',
          data: top10.map((t) => t.total_volume),
          backgroundColor: 'hsla(252, 87%, 65%, 0.8)',
          borderColor: 'hsl(252, 87%, 65%)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [traders]);

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsla(252, 87%, 65%, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => 'Volume: ' + formatNumber(context.raw),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(230, 20%, 55%)',
          callback: (value: any) => formatNumber(value),
        },
        grid: { color: 'hsla(230, 30%, 18%, 0.5)' },
      },
      y: {
        ticks: { color: 'hsl(230, 20%, 55%)', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(column)}
      className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${
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
    <div className="glass-panel glass-panel-hover p-6">
      <h2 className="text-xl font-bold gradient-text mb-5 pb-4 border-b border-border/50 flex items-center gap-2">
        <Crown className="w-5 h-5" />
        Top Traders
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-4 text-sm">
          ⚠️ Error loading traders: {error}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Filter traders..."
        className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary mb-5"
      />

      {/* Chart */}
      <div className="h-[250px] mb-5">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl">
        <table className="w-full table-striped">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <SortableHeader column="name">Trader</SortableHeader>
              <SortableHeader column="total_volume">Volume</SortableHeader>
              <SortableHeader column="trade_count">Trades</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                Top Market
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTraders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No traders found
                </td>
              </tr>
            ) : (
              filteredAndSortedTraders.slice(0, 30).map((trader, idx) => (
                <tr key={`trader-${trader.name}-${idx}`} className="border-b border-border/30">
                  <td className="px-3 py-3 text-sm font-semibold">{trader.name || 'Unknown'}</td>
                  <td className="px-3 py-3 text-sm">{formatNumber(trader.total_volume)}</td>
                  <td className="px-3 py-3 text-sm">{trader.trade_count}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground max-w-[150px] truncate">
                    {trader.top_market || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
