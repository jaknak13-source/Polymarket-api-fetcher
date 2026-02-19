import requests
import json
import time
import threading
import os
import tempfile
from datetime import datetime, timedelta, UTC
import logging
import csv
import io
import atexit          ### NEW
import signal         ### NEW
import sys            ### NEW

# ---------------- CONFIG ----------------

API_URL = "https://data-api.polymarket.com/trades"
FETCH_INTERVAL = 5  # seconds
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TEMP_DIR = os.path.join(DATA_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

RECENT_TRADES_FILE = "trades_recent.json"
WHALES_FILE = "whales.json"
TOP_TRADERS_FILE = "traders_top.json"
MARKETS_STATS_FILE = "markets_stats.json"
ORDERFLOW_FILE = "orderflow.json"
FULL_TRADES_SIZE_FILE = "full_trades_sorted.txt"    # match routers-api expectation
FULL_TRADES_CHRONO_FILE = "full_trades_chrono.txt"  # match routers-api expectation

### Backup-related config
BACKUP_DIR = os.path.join(BASE_DIR, "backups")   # where backups are stored
os.makedirs(BACKUP_DIR, exist_ok=True)

WHALE_THRESHOLD_USD = 999
RECENT_COUNT = 50
ORDERFLOW_WINDOW = 60   # seconds
VOLATILITY_WINDOW = 60  # seconds

# ---------------- LOGGING ----------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

# ---------------- ATOMIC SAVE ----------------


def atomic_save(data, path, mode="w", is_json=False, encoding="utf-8"):
    """
    Atomically save data to a file.
    On Windows this avoids explicit os.remove() to reduce permission issues.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    newline_arg = "" if not is_json else None

    # temp file goes into your TEMP_DIR under data/
    temp_fd, temp_path = tempfile.mkstemp(dir=TEMP_DIR)

    try:
        with os.fdopen(temp_fd, mode, encoding=encoding, newline=newline_arg) as f:
            if is_json:
                json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                f.write(data)

        # Directly replace; let os.replace handle overwriting
        os.replace(temp_path, path)

    except Exception as e:
        logging.error(f"Atomic save error for {path}: {e}")
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

# ---------------- TRADE PARSING ----------------


def parse_trade(trade):
    """Parse & sanitize trade dict from API."""
    try:
        ts = int(trade.get("timestamp", 0))
        parsed = {
            "size": float(trade.get("size", 0)),
            "market_title": str(trade.get("title", "")),
            "outcome": str(trade.get("outcome", "")),
            "price": float(trade.get("price", 0)),
            # timezone-aware UTC timestamp
            "ts_iso": datetime.fromtimestamp(ts, UTC).isoformat().replace("+00:00", "Z"),
            "name": str(trade.get("name", "")),
            "pseudonym": str(trade.get("pseudonym", "")),
            "proxyWallet": str(trade.get("proxyWallet", "")),
            "transactionHash": str(trade.get("transactionHash", "")),
            "side": str(trade.get("side", "")).lower(),
            "outcomeIndex": trade.get("outcomeIndex", 0),
        }
    except (KeyError, ValueError, TypeError):
        return None
    return parsed


# ---------------- IN-MEMORY TRADE DB ----------------


class TradeDB:
    def __init__(self):
        self.lock = threading.Lock()
        self.trades_by_hash = {}  # transactionHash -> trade dict
        self.sorted_trades_chrono = []
        self.sorted_trades_by_size = []

    def update(self, trades):
        with self.lock:
            new_trades = []
            for t in trades:
                thash = t["transactionHash"]
                if thash not in self.trades_by_hash:
                    self.trades_by_hash[thash] = t
                    new_trades.append(t)

            # Incremental updates
            if new_trades:
                self.sorted_trades_chrono.extend(new_trades)
                self.sorted_trades_chrono.sort(
                    key=lambda x: x["ts_iso"], reverse=True
                )

                self.sorted_trades_by_size.extend(new_trades)
                self.sorted_trades_by_size.sort(
                    key=lambda x: x["size"], reverse=True
                )

            return len(new_trades)

    def get_all(self):
        with self.lock:
            return list(self.trades_by_hash.values())

    def get_recent(self, n):
        with self.lock:
            return self.sorted_trades_chrono[:n]

    def get_sorted_by_size(self):
        with self.lock:
            return self.sorted_trades_by_size

    def get_sorted_chrono(self):
        with self.lock:
            return self.sorted_trades_chrono


# ---------------- ANALYTICS ----------------


def compute_whales(trades):
    return [t for t in trades if t["size"] * t["price"] > WHALE_THRESHOLD_USD]


def compute_top_traders(trades):
    traders = {}
    for t in trades:
        name = t["name"] or t["pseudonym"] or t["proxyWallet"]
        if name not in traders:
            traders[name] = {
                "total_volume": 0,
                "trade_count": 0,
                "markets": {},
                "outcomes": {},
            }

        traders[name]["total_volume"] += t["size"] * t["price"]
        traders[name]["trade_count"] += 1

        mkt = t["market_title"]
        outc = t["outcome"]
        traders[name]["markets"][mkt] = traders[name]["markets"].get(mkt, 0) + 1
        traders[name]["outcomes"][outc] = traders[name]["outcomes"].get(outc, 0) + 1

    res = []
    for nm, aggr in traders.items():
        top_market = max(aggr["markets"], key=lambda k: aggr["markets"][k])
        top_outcome = max(aggr["outcomes"], key=lambda k: aggr["outcomes"][k])
        res.append(
            {
                "name": nm,
                "total_volume": aggr["total_volume"],
                "trade_count": aggr["trade_count"],
                "top_market": top_market,
                "top_outcome": top_outcome,
            }
        )

    res.sort(key=lambda x: x["total_volume"], reverse=True)
    return res


def _parse_ts_iso_utc(ts_iso):
    # ts_iso is like '2026-01-23T18:00:00Z'
    if ts_iso.endswith("Z"):
        ts_iso = ts_iso[:-1] + "+00:00"
    return datetime.fromisoformat(ts_iso)


def compute_market_stats(trades):
    markets = {}
    trades_by_market = {}

    for t in trades:
        mkt = t["market_title"]
        if mkt not in markets:
            markets[mkt] = {
                "last_price": t["price"],
                "total_volume": 0,
                "buy_count": 0,
                "sell_count": 0,
                "whale_count": 0,
                "volatility_1m": 0,
                "outcomes": {},
            }
            trades_by_market[mkt] = []

        markets[mkt]["last_price"] = t["price"]
        markets[mkt]["total_volume"] += t["size"] * t["price"]

        # Robust buy/sell inference
        side_raw = t.get("side", "").lower()
        if "buy" in side_raw:
            side = "buy"
        elif "sell" in side_raw:
            side = "sell"
        else:
            side = "buy" if t.get("outcomeIndex", 0) == 0 else "sell"

        if side == "buy":
            markets[mkt]["buy_count"] += 1
        else:
            markets[mkt]["sell_count"] += 1

        if t["size"] * t["price"] > WHALE_THRESHOLD_USD:
            markets[mkt]["whale_count"] += 1

        oc = t["outcome"]
        markets[mkt]["outcomes"][oc] = (
            markets[mkt]["outcomes"].get(oc, 0) + t["size"] * t["price"]
        )
        trades_by_market[mkt].append(t)

    # Volatility
    now = datetime.now(UTC)
    one_min_ago = now - timedelta(seconds=VOLATILITY_WINDOW)
    for mkt, arr in trades_by_market.items():
        prices = [
            x["price"]
            for x in arr
            if _parse_ts_iso_utc(x["ts_iso"]) >= one_min_ago
        ]
        if len(prices) > 1:
            mean_p = sum(prices) / len(prices)
            variance = sum((p - mean_p) ** 2 for p in prices) / len(prices)
            markets[mkt]["volatility_1m"] = variance ** 0.5
        else:
            markets[mkt]["volatility_1m"] = 0

    return markets


def compute_orderflow(trades):
    now = datetime.now(UTC)
    window_start = now - timedelta(seconds=ORDERFLOW_WINDOW)

    markets = {}
    for t in trades:
        t_time = _parse_ts_iso_utc(t["ts_iso"])
        if t_time < window_start:
            continue

        mkt = t["market_title"]
        if mkt not in markets:
            markets[mkt] = {
                "buy_volume": 0,
                "sell_volume": 0,
                "buy_count": 0,
                "sell_count": 0,
            }

        side_raw = t.get("side", "").lower()
        if "buy" in side_raw:
            side = "buy"
        elif "sell" in side_raw:
            side = "sell"
        else:
            side = "buy" if t.get("outcomeIndex", 0) == 0 else "sell"

        if side == "buy":
            markets[mkt]["buy_volume"] += t["size"] * t["price"]
            markets[mkt]["buy_count"] += 1
        else:
            markets[mkt]["sell_volume"] += t["size"] * t["price"]
            markets[mkt]["sell_count"] += 1

    output = {}
    for mkt, m in markets.items():
        imbalance = m["buy_volume"] - m["sell_volume"]
        total = m["buy_volume"] + m["sell_volume"] or 1
        momentum_score = (m["buy_count"] - m["sell_count"]) / (
            (m["buy_count"] + m["sell_count"]) or 1
        )
        output[mkt] = {
            "buy_volume": m["buy_volume"],
            "sell_volume": m["sell_volume"],
            "buy_count": m["buy_count"],
            "sell_count": m["sell_count"],
            "imbalance": imbalance,
            "momentum_score": momentum_score,
        }

    return output


# ---------------- CSV HELPER ----------------


def trades_to_csv(trades, fields):
    """Convert sorted trades list to CSV string with header."""
    output = io.StringIO()
    # delimiter=';' for German Excel
    writer = csv.DictWriter(output, fieldnames=fields, delimiter=";")
    writer.writeheader()
    writer.writerows(trades)
    return output.getvalue()


# ---------------- BACKUP HELPER ----------------

def backup_data():
    """
    Create a timestamped backup of all data files.
    Called at startup and on clean shutdown.
    """
    try:
        ts = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        backup_dir = os.path.join(BACKUP_DIR, ts)
        os.makedirs(backup_dir, exist_ok=True)

        for fname in [
            RECENT_TRADES_FILE,
            WHALES_FILE,
            TOP_TRADERS_FILE,
            MARKETS_STATS_FILE,
            ORDERFLOW_FILE,
            FULL_TRADES_SIZE_FILE,
            FULL_TRADES_CHRONO_FILE,
        ]:
            src = os.path.join(DATA_DIR, fname)
            if os.path.exists(src):
                dst = os.path.join(backup_dir, fname)
                with open(src, "rb") as fsrc, open(dst, "wb") as fdst:
                    fdst.write(fsrc.read())

        logging.info(f"Backup created at {backup_dir}")
    except Exception as e:
        logging.error(f"Backup failed: {e}")


# ---------------- POLYMARKET BOT ----------------


class PolymarketBot:
    def __init__(self):
        self.db = TradeDB()
        os.makedirs(DATA_DIR, exist_ok=True)

    def run(self):
        logging.info("Starting Polymarket local engine (Ctrl+C to exit)...")

        ### Run a backup right after startup
        backup_data()

        while True:
            try:
                self.fetch_and_update()
                self.compute_and_save()
            except Exception as e:
                logging.error(f"Error in main loop: {e}")
            time.sleep(FETCH_INTERVAL)

    def fetch_and_update(self):
        try:
            resp = requests.get(API_URL, timeout=5)
            if not resp.ok:
                logging.warning(f"API returned {resp.status_code}")
                return

            raw_trades = resp.json()
            parsed_trades = [parse_trade(t) for t in raw_trades if parse_trade(t)]
            new_trades = self.db.update(parsed_trades)
            logging.info(
                f"Fetched {len(parsed_trades)} trades; {new_trades} new trades added."
            )
        except requests.RequestException as e:
            logging.warning(f"Network error: {e}")

    def compute_and_save(self):
        trades = self.db.get_all()
        recent = self.db.get_recent(RECENT_COUNT)
        whales = compute_whales(trades)
        top_traders = compute_top_traders(trades)
        market_stats = compute_market_stats(trades)
        orderflow = compute_orderflow(trades)
        sorted_by_size = self.db.get_sorted_by_size()
        sorted_chrono = self.db.get_sorted_chrono()

        fields = [
            "size",
            "market_title",
            "outcome",
            "price",
            "ts_iso",
            "name",
            "pseudonym",
            "proxyWallet",
            "transactionHash",
            "side",
            "outcomeIndex",
        ]

        # JSON files used by your API & WebSocket
        atomic_save(
            recent,
            os.path.join(DATA_DIR, RECENT_TRADES_FILE),
            is_json=True,
        )
        atomic_save(
            whales,
            os.path.join(DATA_DIR, WHALES_FILE),
            is_json=True,
        )
        atomic_save(
            top_traders,
            os.path.join(DATA_DIR, TOP_TRADERS_FILE),
            is_json=True,
        )
        atomic_save(
            market_stats,
            os.path.join(DATA_DIR, MARKETS_STATS_FILE),
            is_json=True,
        )
        atomic_save(
            orderflow,
            os.path.join(DATA_DIR, ORDERFLOW_FILE),
            is_json=True,
        )

        # Text files used by /api/full/sorted and /api/full/chrono (routers-api.py)
        atomic_save(
            trades_to_csv(sorted_by_size, fields),
            os.path.join(DATA_DIR, FULL_TRADES_SIZE_FILE),
            is_json=False,
        )
        atomic_save(
            trades_to_csv(sorted_chrono, fields),
            os.path.join(DATA_DIR, FULL_TRADES_CHRONO_FILE),
            is_json=False,
        )


# ---------------- SHUTDOWN HANDLING ----------------

def _graceful_shutdown(signum=None, frame=None):
    """
    Signal handler + atexit target.
    Runs backup before exit.
    """
    logging.info(f"Received shutdown signal {signum}, creating backup and exiting...")
    backup_data()
    # If called from a signal handler, exit explicitly.
    if signum is not None:
        sys.exit(0)

# ---------------- ENTRYPOINT ----------------

if __name__ == "__main__":
    # Register atexit backup (normal interpreter exit)
    atexit.register(backup_data)

    # Register signal handlers for clean shutdown (Ctrl+C, systemd stop, docker stop)
    signal.signal(signal.SIGINT, _graceful_shutdown)
    signal.signal(signal.SIGTERM, _graceful_shutdown)

    bot = PolymarketBot()
    bot.run()
