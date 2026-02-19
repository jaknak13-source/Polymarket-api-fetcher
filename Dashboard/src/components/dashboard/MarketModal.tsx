import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Market, OrderflowMarket } from '@/types/polymarket';
import { formatNumber } from '@/lib/format';
import { X, Info } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface MarketModalProps {
  isOpen: boolean;
  marketTitle: string;
  market: Market | null;
  orderflow: OrderflowMarket | null;
  onClose: () => void;
}

export function MarketModal({ isOpen, marketTitle, market, orderflow, onClose }: MarketModalProps) {
  const chartData = useMemo(() => {
    if (!market?.outcomes || Object.keys(market.outcomes).length === 0) {
      return null;
    }

    const entries = Object.entries(market.outcomes);
    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          data: entries.map((e) => e[1]),
          backgroundColor: [
            'hsla(160, 84%, 39%, 0.8)',
            'hsla(0, 72%, 51%, 0.8)',
            'hsla(217, 91%, 60%, 0.8)',
            'hsla(38, 92%, 50%, 0.8)',
            'hsla(280, 87%, 55%, 0.8)',
          ],
          borderColor: [
            'hsl(160, 84%, 39%)',
            'hsl(0, 72%, 51%)',
            'hsl(217, 91%, 60%)',
            'hsl(38, 92%, 50%)',
            'hsl(280, 87%, 55%)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [market]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(230, 20%, 55%)',
          font: { size: 13, weight: 600 as const },
          padding: 15,
        },
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsla(252, 87%, 65%, 0.5)',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel p-8 max-w-[900px] w-[90%] max-h-[90vh] overflow-y-auto border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text pr-8">{marketTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors hover:text-destructive"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Last Price" value={market?.last_price?.toFixed(4) || '-'} />
          <StatCard label="Total Volume" value={formatNumber(market?.total_volume || 0)} />
          <StatCard label="Buy Trades" value={String(market?.buy_count || 0)} valueClass="text-bullish" />
          <StatCard label="Sell Trades" value={String(market?.sell_count || 0)} valueClass="text-bearish" />
          <StatCard label="Whale Trades" value={String(market?.whale_count || 0)} />
          <StatCard label="Volatility (1m)" value={market?.volatility_1m?.toFixed(4) || '-'} />
          {orderflow && (
            <>
              <StatCard label="Order Imbalance" value={orderflow.imbalance?.toFixed(2) || '-'} />
              <StatCard label="Momentum Score" value={orderflow.momentum_score?.toFixed(2) || '-'} />
            </>
          )}
        </div>

        {/* Chart */}
        {chartData && (
          <div className="h-[300px]">
            <h3 className="text-center text-sm font-semibold text-secondary-foreground uppercase tracking-wider mb-4">
              Outcome Distribution
            </h3>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        )}

        {!chartData && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
            <Info className="w-5 h-5" />
            No outcome distribution data available
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatCard({ label, value, valueClass = '' }: StatCardProps) {
  return (
    <div className="bg-muted/30 p-5 rounded-xl border border-border/50 stat-card">
      <div className={`text-2xl font-bold mb-1 ${valueClass || 'gradient-text'}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
