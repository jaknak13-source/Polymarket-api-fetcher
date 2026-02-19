import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { OrderflowMarket } from '@/types/polymarket';
import { formatNumber } from '@/lib/format';
import { Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OrderflowChartProps {
  orderflow: Record<string, OrderflowMarket>;
  error?: string;
}

export function OrderflowChart({ orderflow, error }: OrderflowChartProps) {
  const chartData = useMemo(() => {
    const markets = Object.entries(orderflow)
      .map(([title, data]) => ({
        title,
        ...data,
        totalVolume: data.buy_volume + data.sell_volume,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 20);

    return {
      labels: markets.map((m) => (m.title.length > 30 ? m.title.substring(0, 30) + '...' : m.title)),
      datasets: [
        {
          label: 'Buy Volume',
          data: markets.map((m) => m.buy_volume),
          backgroundColor: 'hsla(160, 84%, 39%, 0.8)',
          borderColor: 'hsl(160, 84%, 39%)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Sell Volume',
          data: markets.map((m) => m.sell_volume),
          backgroundColor: 'hsla(0, 72%, 51%, 0.8)',
          borderColor: 'hsl(0, 72%, 51%)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [orderflow]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(230, 20%, 55%)',
          font: { size: 12, weight: 600 as const },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsla(252, 87%, 65%, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (items: any[]) => {
            if (items.length > 0) {
              // Get full title from original data
              const index = items[0].dataIndex;
              const fullTitle = Object.keys(orderflow).sort((a, b) => {
                const dataA = orderflow[a];
                const dataB = orderflow[b];
                return (dataB.buy_volume + dataB.sell_volume) - (dataA.buy_volume + dataA.sell_volume);
              })[index];
              return fullTitle || items[0].label;
            }
            return '';
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = formatNumber(context.raw);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(230, 20%, 55%)',
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
        },
        grid: { color: 'hsla(230, 30%, 18%, 0.5)' },
      },
      y: {
        ticks: {
          color: 'hsl(230, 20%, 55%)',
          callback: (value: any) => formatNumber(value),
        },
        grid: { color: 'hsla(230, 30%, 18%, 0.5)' },
      },
    },
  };

  return (
    <div className="glass-panel glass-panel-hover p-6 mb-6">
      <h2 className="text-xl font-bold gradient-text mb-5 pb-4 border-b border-border/50 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Orderflow Analysis
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-4 text-sm">
          ⚠️ Error loading orderflow: {error}
        </div>
      )}

      <div className="h-[350px]">
        {Object.keys(orderflow).length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading orderflow data...
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
