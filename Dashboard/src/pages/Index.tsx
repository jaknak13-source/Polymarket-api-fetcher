import { useState, useMemo, useCallback } from 'react';
import { usePolymarketData } from '@/hooks/usePolymarketData';
import { calculateSentiment } from '@/lib/sentiment';
import type { TimeframeFilter } from '@/types/polymarket';
import {
  DashboardHeader,
  SentimentGauge,
  ControlsBar,
  TradesTable,
  WhalePanel,
  TradersPanel,
  MarketsTable,
  OrderflowChart,
  MarketModal,
} from '@/components/dashboard';

const PolymarketDashboard = () => {
  // API data
  const { trades, whales, traders, markets, orderflow, lastUpdated, isLoading, errors } = usePolymarketData();

  // Filter state
  const [searchValue, setSearchValue] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [tradeLimit, setTradeLimit] = useState(100);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');

  // Modal state
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  // Calculate sentiment from trades with timeframe filter
  const sentiment = useMemo(() => {
    return calculateSentiment(trades, 500, timeframe);
  }, [trades, timeframe]);

  // Check if connected (at least one successful fetch)
  const isConnected = useMemo(() => {
    return trades.length > 0 || Object.keys(markets).length > 0;
  }, [trades, markets]);

  // Handle market click
  const handleMarketClick = useCallback((marketTitle: string) => {
    setSelectedMarket(marketTitle);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMarket(null);
  }, []);

  // Get selected market data
  const selectedMarketData = selectedMarket ? markets[selectedMarket] || null : null;
  const selectedOrderflow = selectedMarket ? orderflow[selectedMarket] || null : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6">
        {/* Header with Alpha badge, intro, and feedback */}
        <DashboardHeader lastUpdated={lastUpdated} isConnected={isConnected || isLoading} />

        {/* Sentiment Gauge */}
        <SentimentGauge sentiment={sentiment} />

        {/* Controls Bar */}
        <ControlsBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          sideFilter={sideFilter}
          onSideFilterChange={setSideFilter}
          tradeLimit={tradeLimit}
          onTradeLimitChange={setTradeLimit}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        {/* Recent Trades Table */}
        <TradesTable
          trades={trades}
          searchValue={searchValue}
          sideFilter={sideFilter}
          limit={tradeLimit}
          error={errors.trades}
        />

        {/* Two Column Layout: Whales & Traders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WhalePanel whales={whales} error={errors.whales} />
          <TradersPanel traders={traders} error={errors.traders} />
        </div>

        {/* Markets Overview */}
        <MarketsTable
          markets={markets}
          orderflow={orderflow}
          searchValue={searchValue}
          error={errors.markets}
          onMarketClick={handleMarketClick}
        />

        {/* Orderflow Chart */}
        <OrderflowChart orderflow={orderflow} error={errors.orderflow} />

        {/* Market Detail Modal */}
        <MarketModal
          isOpen={!!selectedMarket}
          marketTitle={selectedMarket || ''}
          market={selectedMarketData}
          orderflow={selectedOrderflow}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default PolymarketDashboard;
