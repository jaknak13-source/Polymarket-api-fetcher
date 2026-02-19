import type { Trade, SentimentData, TimeframeFilter } from '@/types/polymarket';

/**
 * Calculate market sentiment from trades
 * 
 * Bullish signals (betting on positive outcomes):
 * - BUY YES: Buying a positive outcome position
 * - SELL NO: Closing a negative position (bullish exit)
 * 
 * Bearish signals (betting against positive outcomes):
 * - BUY NO: Buying a negative outcome position
 * - SELL YES: Closing a positive position (bearish exit)
 */
export function calculateSentiment(
  trades: Trade[],
  maxTrades: number = 500,
  timeframeFilter?: TimeframeFilter
): SentimentData {
  // Filter by timeframe if specified
  let filteredTrades = trades;
  
  if (timeframeFilter && timeframeFilter !== 'all') {
    const now = Date.now();
    const hoursMap: Record<TimeframeFilter, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      'all': Infinity
    };
    const cutoffMs = now - (hoursMap[timeframeFilter] * 60 * 60 * 1000);
    
    filteredTrades = trades.filter(trade => {
      const tradeTime = new Date(trade.ts_iso).getTime();
      return tradeTime >= cutoffMs;
    });
  }

  // Take the most recent trades up to maxTrades
  const recentTrades = filteredTrades.slice(0, maxTrades);

  if (recentTrades.length === 0) {
    return {
      bullishCount: 0,
      bearishCount: 0,
      totalAnalyzed: 0,
      bullishPercent: 0,
      bearishPercent: 0,
      sentimentScore: 50, // Neutral when no data
    };
  }

  let bullishCount = 0;
  let bearishCount = 0;

  recentTrades.forEach(trade => {
    const outcomeUpper = trade.outcome?.toUpperCase() || '';
    const sideUpper = trade.side?.toUpperCase() || '';

    // Bullish: BUY/YES or SELL/NO
    const isBullish =
      (sideUpper === 'BUY' && outcomeUpper === 'YES') ||
      (sideUpper === 'SELL' && outcomeUpper === 'NO');

    // Bearish: BUY/NO or SELL/YES
    const isBearish =
      (sideUpper === 'BUY' && outcomeUpper === 'NO') ||
      (sideUpper === 'SELL' && outcomeUpper === 'YES');

    if (isBullish) {
      bullishCount++;
    } else if (isBearish) {
      bearishCount++;
    }
    // Note: Trades that don't match either pattern are not counted
  });

  const total = bullishCount + bearishCount;

  // Prevent division by zero
  if (total === 0) {
    return {
      bullishCount: 0,
      bearishCount: 0,
      totalAnalyzed: recentTrades.length,
      bullishPercent: 0,
      bearishPercent: 0,
      sentimentScore: 50,
    };
  }

  const bullishPercent = (bullishCount / total) * 100;
  const bearishPercent = (bearishCount / total) * 100;
  const sentimentScore = bullishPercent;

  return {
    bullishCount,
    bearishCount,
    totalAnalyzed: total,
    bullishPercent: parseFloat(bullishPercent.toFixed(1)),
    bearishPercent: parseFloat(bearishPercent.toFixed(1)),
    sentimentScore: Math.round(sentimentScore),
  };
}

/**
 * Get sentiment color based on score
 */
export function getSentimentColor(score: number): string {
  if (score < 40) return 'text-bearish';
  if (score > 60) return 'text-bullish';
  return 'text-neutral';
}

/**
 * Get sentiment label based on score
 */
export function getSentimentLabel(score: number): string {
  if (score < 30) return 'Very Bearish';
  if (score < 45) return 'Bearish';
  if (score < 55) return 'Neutral';
  if (score < 70) return 'Bullish';
  return 'Very Bullish';
}

/**
 * Calculate market-specific imbalance indicator
 * Returns: 'bullish' | 'bearish' | 'neutral'
 */
export function getMarketSentiment(
  buyCount: number,
  sellCount: number
): 'bullish' | 'bearish' | 'neutral' {
  const total = buyCount + sellCount;
  if (total === 0) return 'neutral';
  
  const buyRatio = buyCount / total;
  
  if (buyRatio > 0.6) return 'bullish';
  if (buyRatio < 0.4) return 'bearish';
  return 'neutral';
}
