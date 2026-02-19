// Detect where the frontend is running
const hostname = window.location.hostname;

// True if opened as localhost / 127.0.0.1 / ::1
const isLocalhost =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]"; // IPv6 localhost [web:110][web:138][web:139]

// API configuration
// - Localhost frontend  -> use local backend on 8000
// - Anything else (LAN IP, domain, etc.) -> use backend on 8001
const API_BASE = isLocalhost
  ? "http://127.0.0.1:8000"
  : "http://192.168.178.28:8001"; // change to your public/tunnel URL if needed

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// API endpoints matching the existing backend
export const api = {
  // recent trades
  getTrades: () => fetchAPI<any[]>("/api/trades/recent"),

  // whale trades (note: backend is /api/trades/whales)
  getWhales: () => fetchAPI<any[]>("/api/trades/whales"),

  // top traders (note: backend is /api/traders/top)
  getTraders: () => fetchAPI<any[]>("/api/traders/top"),

  // markets overview
  getMarkets: () => fetchAPI<Record<string, any>>("/api/markets"),

  // orderflow data
  getOrderflow: () => fetchAPI<Record<string, any>>("/api/orderflow"),

  // Export URLs (for download links)
  exportBySizeUrl: `${API_BASE}/api/full/sorted`,
  exportChronoUrl: `${API_BASE}/api/full/chrono`,
};

export { API_BASE };
