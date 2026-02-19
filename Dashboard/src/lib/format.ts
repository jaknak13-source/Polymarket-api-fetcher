/**
 * Format a number as currency with appropriate suffix (K, M)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}

/**
 * Format an ISO timestamp to local time
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Format date with time
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Shorten a blockchain hash for display
 */
export function shortenHash(hash: string | null | undefined): string {
  if (!hash) return '-';
  return hash.substring(0, 10) + '...';
}

/**
 * Shorten a wallet address for display
 */
export function shortenAddress(addr: string | null | undefined): string {
  if (!addr) return '-';
  if (addr.length < 12) return addr;
  return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
}

/**
 * Get trader display name from trade data
 */
export function getTraderName(trade: { name?: string; pseudonym?: string; proxyWallet?: string }): string {
  return trade.name || trade.pseudonym || shortenAddress(trade.proxyWallet);
}
