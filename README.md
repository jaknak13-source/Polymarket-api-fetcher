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
```
Polymarket-api-fetcher/
├── bot.py                    # Data fetcher and analytics engine           
├── main.py                   # FastAPI app, starts bot + serves API       
├── file_cache.py             # File watcher and in-memory cache           
├── APIpublic.py              # Optional standalone public API on port 8001
├── requirements.txt          # Python dependencies                       
├── Dockerfile.txt            # Docker setup for the backend               
├── fast launch bat/          # Windows batch files for quick launch       
├── routers/                                                            
│   ├── api.py                # REST routes                               
│   └── ws.py                 # WebSocket routes                          
├── data/                     # Runtime JSON/CSV output (auto-generated)  
├── data_backup/              # Automatic backups (auto-generated)        
└── Dashboard/                # React/Vite frontend                       
    ├── src/                                                       
    │   ├── config.ts         # API URL config — edit this for your IP   
    │   ├── components/                                            
    │   ├── pages/                                         
    │   ├── hooks/                                          
    │   └── types/                                       
    ├── package.json                                       
    └── vite.config.ts                                    
```

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

## Installation Steps

Follow these steps to set up and run the project locally.

### 1. Clone Repository
```bash
git clone https://github.com/jaknak13-source/Polymarket-api-fetcher.git
cd Polymarket-api-fetcher
```

### 2. Backend Setup
Create and activate a virtual environment, then install Python dependencies.

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd Dashboard
npm install
cd ..
```

### 4. Configuration
Edit `Dashboard/src/config.ts` to set your local IP (line 12):

```ts
: "http://<YOUR_LOCAL_IP>:8000";  // e.g. http://192.168.1.100:8000
```

For same-machine access, use `http://127.0.0.1:8000` (line 11).

## Running the Project

Use two terminals.

### Terminal 1: Backend
```bash
python main.py
```

### Terminal 2: Frontend
```bash
cd Dashboard
npm run dev
```

Open in browser:
- Dashboard: http://localhost:5173
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health 

## Quick Launch (Windows)
Double-click files in `fast launch bat/`. Edit paths first (replace "your path").

| File                  | Action                  |
|-----------------------|-------------------------|
| launch backend main.bat | Starts Python backend  |
| launch frontend.bat    | Starts dashboard       |
| Public API launch.bat  | Starts API on port 8001|

## Docker (Optional)
```bash
docker build -f Dockerfile.txt -t polymarket-backend .
docker run -p 8000:8000 polymarket-backend
```

## API Endpoints
Base: `http://localhost:8000`

| Endpoint              | Description                  |
|-----------------------|------------------------------|
| GET /api/trades/recent| Recent trades               |
| GET /api/trades/whales| Whale trades                |
| GET /api/traders/top  | Top traders                 |
| GET /api/markets      | All market stats            |
| GET /api/markets/{market} | Single market stats   |
| GET /api/orderflow    | Orderflow metrics           |
| GET /api/full/sorted  | Sorted trades (CSV)         |
| GET /api/full/chrono  | Chronological trades (CSV)  |
| WS /ws/trades         | Live trade WebSocket        | 

## Troubleshooting

| Problem                | Solution                              |
|------------------------|---------------------------------------|
| python: command not found | Use `python3`                        |
| pip install fails     | Activate virtual environment         |
| npm install fails     | Install Node.js 18+                  |
| No data in dashboard  | Start backend first (`python main.py`)|
| CORS error            | Check config.ts points to backend    |
| Port in use           | Kill process or edit main.py port    | 

## Contributing
Welcome pull requests! Ideas:
- Add P/L estimates, open interest.
- Advanced dashboard filters/visuals.
- Docker Compose/K8s deployment.
  
## License
MIT License — see LICENSE file.
