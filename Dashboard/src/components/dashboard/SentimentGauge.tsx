import { useMemo } from 'react';
import type { SentimentData } from '@/types/polymarket';
import { getSentimentColor, getSentimentLabel } from '@/lib/sentiment';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface SentimentGaugeProps {
  sentiment: SentimentData;
}

export function SentimentGauge({ sentiment }: SentimentGaugeProps) {
  // Calculate needle angle: 0 = -90deg (bearish), 100 = 90deg (bullish)
  const needleAngle = useMemo(() => {
    return (sentiment.sentimentScore / 100) * 180 - 90;
  }, [sentiment.sentimentScore]);

  const sentimentColorClass = getSentimentColor(sentiment.sentimentScore);
  const sentimentLabel = getSentimentLabel(sentiment.sentimentScore);

  return (
    <section className="glass-panel p-8 mb-6">
      <h2 className="text-center text-sm font-semibold text-secondary-foreground uppercase tracking-widest mb-6">
        Market Sentiment • Last 500 Trades
      </h2>

      {/* Gauge Visualization */}
      <div className="relative w-full max-w-[400px] mx-auto h-[180px] pt-5">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 110" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
              <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
              <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path 
            d="M 20 95 A 80 80 0 0 1 180 95" 
            fill="none" 
            stroke="url(#gaugeGradient)" 
            strokeWidth="16" 
            strokeLinecap="round" 
            opacity="0.3"
          />
          {/* Active arc */}
          <path 
            d="M 20 95 A 80 80 0 0 1 180 95" 
            fill="none" 
            stroke="url(#gaugeGradient)" 
            strokeWidth="16" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Needle */}
        <div 
          className="absolute bottom-[10px] left-1/2 w-[3px] h-[80px] rounded bg-gradient-to-t from-primary to-accent gauge-needle"
          style={{ 
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            boxShadow: '0 0 15px hsl(var(--primary) / 0.6)'
          }}
        />
        
        {/* Center dot */}
        <div 
          className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent"
          style={{ boxShadow: '0 0 15px hsl(var(--primary) / 0.8)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-5 px-5 max-w-[400px] mx-auto">
        <span className="text-sm font-semibold text-bearish opacity-70">Bearish</span>
        <span className="text-sm font-semibold text-neutral opacity-70">Neutral</span>
        <span className="text-sm font-semibold text-bullish opacity-70">Bullish</span>
      </div>

      {/* Sentiment Label */}
      <div className="text-center mt-4">
        <span className={`text-lg font-bold ${sentimentColorClass}`}>
          {sentimentLabel}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-bullish" />}
          value={`${sentiment.bullishPercent}%`}
          label="Bullish (Yes/Buy)"
          valueClass="text-bullish"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />}
          value={sentiment.sentimentScore.toString()}
          label="Sentiment Score"
          valueClass={sentimentColorClass}
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5 text-bearish" />}
          value={`${sentiment.bearishPercent}%`}
          label="Bearish (No/Sell)"
          valueClass="text-bearish"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />}
          value={sentiment.totalAnalyzed.toString()}
          label="Trades Analyzed"
          valueClass="gradient-text"
        />
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueClass?: string;
}

function StatCard({ icon, value, label, valueClass = '' }: StatCardProps) {
  return (
    <div className="text-center p-5 bg-muted/30 rounded-xl border border-border/50 stat-card">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className={`text-3xl font-bold mb-1 ${valueClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
