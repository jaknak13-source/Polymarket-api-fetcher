# Polymarket Local Orderflow Dashboard

Polymarket Local Orderflow Dashboard is an open‑source Python + FastAPI and React/Vite toolkit that fetches real‑time trades from the public Polymarket data API, computes whale activity, top traders, market statistics, and orderflow metrics, and exposes them via a REST + WebSocket backend for a modern, Tailwind‑styled frontend dashboard.

## Status & disclaimer

This project is an early MVP and **not yet production‑ready**. Some parts of the backend and dashboard are still experimental, and you may encounter bugs, incomplete features, or breaking changes between versions. Use it at your own risk and always verify the data before relying on it for real trading or financial decisions.

---

## Features

- Live trade data from the public Polymarket data API (no API key required).
- Local data engine that stores recent trades and backups to disk.
- Computed analytics: whale trades, top traders, per‑market statistics, orderflow and momentum scores.
- FastAPI backend with REST endpoints and a WebSocket stream.
- React/Vite dashboard with Tailwind CSS and Recharts for data visualization.

---

## Project Structure

Polymarket-api-fetcher/
├── bot.py # Data fetcher and analytics engine
├── main.py # FastAPI app, starts bot + serves API
├── file_cache.py # File watcher and in-memory cache
├── APIpublic.py # Optional standalone public API on port 8001
├── requirements.txt # Python dependencies
├── Dockerfile.txt # Docker setup for the backend
├── fast launch bat/ # Windows batch files for quick launch
├── routers/
│ ├── api.py # REST routes
│ └── ws.py # WebSocket routes
├── data/ # Runtime JSON/CSV output (auto-generated)
├── data_backup/ # Automatic backups (auto-generated)
└── Dashboard/ # React/Vite frontend
├── src/
│ ├── config.ts # API URL config — edit this for your IP
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ └── types/
├── package.json
└── vite.config.ts

text

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
git clone https://github.com/jaknak13-source/Polymarket-api-fetcher.git
cd Polymarket-api-fetcher
2. Install Python dependencies
bash
# Create virtual environment
python -m venv .venv

# Activate it — Windows:
.venv\Scripts\activate

# Activate it — macOS/Linux:
source .venv/bin/activate

# Install packages
pip install -r requirements.txt
3. Install frontend dependencies
bash
cd Dashboard
npm install
cd ..
4. Configure the API URL
Open Dashboard/src/config.ts and update line 12 with your machine's local IP address:

ts
: "http://<YOUR_LOCAL_IP>:8001";  // e.g. http://192.168.1.100:8001
If you only access the dashboard from the same machine, line 11 is fine as-is:

ts
? "http://127.0.0.1:8000"
Running the Project
You need two terminals running at the same time.

Terminal 1 — Start the backend:

bash
python main.py
Terminal 2 — Start the frontend:

bash
cd Dashboard
npm run dev
Then open your browser:

URL	What it is
http://localhost:5173	Frontend dashboard
http://localhost:8000/docs	Backend API docs
http://localhost:8000/health	Health check
Quick Launch (Windows only)
Double-click the batch files inside fast launch bat/. Before using them, open each file and replace "your path" with your actual project folder path.

File	What it does
launch backend main.bat	Starts the Python backend
launch frontend.bat	Starts the frontend dashboard
Public API launch.bat	Starts the optional public API on port 8001
Docker (optional)
bash
docker build -f Dockerfile.txt -t polymarket-backend .
docker run -p 8000:8000 polymarket-backend
API Overview
Base URL: http://localhost:8000

Endpoint	Description
GET /api/trades/recent	Recent trades
GET /api/trades/whales	Whale trades
GET /api/traders/top	Top traders
GET /api/markets	All market stats
GET /api/markets/{market}	Single market stats
GET /api/orderflow	Orderflow metrics
GET /api/full/sorted	All trades sorted by size (CSV)
GET /api/full/chrono	All trades chronological (CSV)
WS /ws/trades	Live trade stream via WebSocket
Troubleshooting
Problem	Fix
python: command not found	Try python3 instead
pip install fails	Make sure virtual environment is activated
npm install fails	Make sure Node.js 18+ is installed
Dashboard shows no data	Start the backend first with python main.py
CORS error in browser	Make sure backend runs on port 8000 and config.ts points to it
Port already in use	Kill the process on that port or change it in main.py
Contributing
Pull requests and issues are welcome. Possible areas to improve:

Additional analytics (P/L estimates, open interest proxies, more timeframes).

More advanced visualizations or filters in the dashboard.

Deployment recipes (Docker Compose, Kubernetes, etc.).

License
This project is licensed under the MIT License — see the LICENSE file for details.

text
