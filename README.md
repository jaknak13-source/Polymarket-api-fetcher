# Polymarket-api-fetcher
Polymarket Local Orderflow Dashboard is an open‑source Python + FastAPI and React/Vite toolkit that fetches real‑time trades from the public Polymarket data API, computes whale activity, top traders, market statistics, and orderflow metrics, and exposes them via a REST + WebSocket backend for a modern, Tailwind‑styled frontend dashboard.
# Polymarket Local Orderflow Dashboard

## Features

- Live trade data from the public Polymarket data API (no API key required).
- Local data engine that stores recent trades and backups to disk.
- Computed analytics:
  - Whale trades (large USD notional).
  - Top traders with volume and favorite markets.
  - Per‑market statistics: volume, buy/sell counts, whale counts, 1‑minute volatility.
  - Short‑term orderflow and momentum scores by market.
- FastAPI backend with:
  - REST endpoints under `/api/...`.
  - WebSocket stream for recent trades at `/ws/trades`.
- React/Vite dashboard with Tailwind CSS and Recharts for data visualization.

## Project structure

Backend (Python):

- `bot.py` – Polymarket data fetcher and analytics engine that writes JSON/CSV files into `data/`.
- `main.py` – FastAPI app, includes REST + WebSocket routes and starts the bot.
- `file_cache.py` – File watcher/cache that keeps JSON/CSV in memory and notifies WebSocket clients on changes.
- `APIpublic.py` – Optional standalone FastAPI app exposing the same API on port `8001`.
- `requirements.txt` – Python dependencies (`fastapi`, `uvicorn`, `requests`).
- `Dockerfile.txt` – Minimal Dockerfile to run the backend with uvicorn on port `8000`.

Frontend (dashboard):

- `package.json`, `package-lock.json` – Frontend dependencies (`lucide-react`, `recharts`, `swr`, etc.).
- Vite/TypeScript/Tailwind config: `vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `vitest.config.ts`.
- `polymarket.ts` – Shared TypeScript types for trades, whales, markets, and orderflow.
- `file.env.local` (optional) – Local dev env file: `NEXT_PUBLIC_API_BASE=http://localhost:8000`.


---

## Prerequisites

Make sure the following are installed before starting:

| Tool | Min. Version | How to check |
|------|-------------|--------------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/jaknak13-source/Polymarket-data-fetcher.git
cd Polymarket-data-fetcher
****
### 2. Install Python dependencies
# Create virtual environment
python -m venv .venv

# Activate it — Windows:
.venv\Scripts\activate
# Activate it — macOS/Linux:
source .venv/bin/activate

# Install packages
pip install -r requirements.txt

### 3. Install frontend dependencies
cd Dashboard
npm install
cd ..

### 4. Configure the API URL
: "http://<YOUR_LOCAL_IP>:8001";

#If you only access the dashboard from the same machine, line 11 is fine as-is:
"http://127.0.0.1:8000"

### Terminal 1 — Start the backend:
python main.py

### Terminal 2 — Start the frontend:
cd Dashboard
npm run dev

### Then open your browser:
| URL                          | What it is         |
| ---------------------------- | ------------------ |
| http://localhost:5173        | Frontend dashboard |
| http://localhost:8000/docs   | Backend API docs   |
| http://localhost:8000/health | Health check       |
