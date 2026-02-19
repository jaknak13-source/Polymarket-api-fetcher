import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type { Trade, Trader, Market, OrderflowMarket } from '@/types/polymarket';

interface DashboardData {
  trades: Trade[];
  whales: Trade[];
  traders: Trader[];
  markets: Record<string, Market>;
  orderflow: Record<string, OrderflowMarket>;
  lastUpdated: Date | null;
  isLoading: boolean;
  errors: {
    trades?: string;
    whales?: string;
    traders?: string;
    markets?: string;
    orderflow?: string;
  };
}

const REFRESH_INTERVAL = 8000; // 8 seconds

export function usePolymarketData() {
  const [data, setData] = useState<DashboardData>({
    trades: [],
    whales: [],
    traders: [],
    markets: {},
    orderflow: {},
    lastUpdated: null,
    isLoading: true,
    errors: {},
  });

  const isMounted = useRef(true);

  const fetchAllData = useCallback(async () => {
    if (!isMounted.current) return;

    const errors: DashboardData['errors'] = {};
    
    // Fetch all endpoints in parallel
    const [tradesResult, whalesResult, tradersResult, marketsResult, orderflowResult] = 
      await Promise.allSettled([
        api.getTrades(),
        api.getWhales(),
        api.getTraders(),
        api.getMarkets(),
        api.getOrderflow(),
      ]);

    if (!isMounted.current) return;

    setData(prev => ({
      ...prev,
      trades: tradesResult.status === 'fulfilled' ? tradesResult.value : prev.trades,
      whales: whalesResult.status === 'fulfilled' ? whalesResult.value : prev.whales,
      traders: tradersResult.status === 'fulfilled' ? tradersResult.value : prev.traders,
      markets: marketsResult.status === 'fulfilled' ? marketsResult.value : prev.markets,
      orderflow: orderflowResult.status === 'fulfilled' ? orderflowResult.value : prev.orderflow,
      lastUpdated: new Date(),
      isLoading: false,
      errors: {
        trades: tradesResult.status === 'rejected' ? tradesResult.reason?.message : undefined,
        whales: whalesResult.status === 'rejected' ? whalesResult.reason?.message : undefined,
        traders: tradersResult.status === 'rejected' ? tradersResult.reason?.message : undefined,
        markets: marketsResult.status === 'rejected' ? marketsResult.reason?.message : undefined,
        orderflow: orderflowResult.status === 'rejected' ? orderflowResult.reason?.message : undefined,
      },
    }));
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    // Initial fetch
    fetchAllData();

    // Set up auto-refresh
    const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchAllData]);

  const refetch = useCallback(() => {
    setData(prev => ({ ...prev, isLoading: true }));
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    refetch,
  };
}
