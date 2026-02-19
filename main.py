import os
import sys
import subprocess

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------------------------
# Paths / imports
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ensure this directory is on sys.path so "routers" and "bot" can be imported/found
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Routers package must be: BASE_DIR/routers/api.py and BASE_DIR/routers/ws.py
from routers import api, ws  # noqa: E402


# -------------------------------------------------
# FastAPI app
# -------------------------------------------------
app = FastAPI(title="Polymarket Data Publisher API")

# CORS: open for dev, tighten allow_origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(api.router, prefix="/api")
app.include_router(ws.router)


# -------------------------------------------------
# Simple health check
# -------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -------------------------------------------------
# Bot starter
# -------------------------------------------------
def start_bot() -> None:
    """
    Start bot.py in a separate process.
    On Windows this opens a new console window.
    """
    bot_path = os.path.join(BASE_DIR, "bot.py")

    if not os.path.exists(bot_path):
        # Fail fast with a clear message if bot.py is missing
        raise FileNotFoundError(f"bot.py not found at: {bot_path}")

    cmd = [sys.executable, bot_path]

    if os.name == "nt":
        # Windows: open in new console window
        CREATE_NEW_CONSOLE = subprocess.CREATE_NEW_CONSOLE
        subprocess.Popen(
            cmd,
            creationflags=CREATE_NEW_CONSOLE,
            cwd=BASE_DIR,
        )
    else:
        # Linux/macOS: background process in same working directory
        subprocess.Popen(
            cmd,
            cwd=BASE_DIR,
        )


# -------------------------------------------------
# Entry point
# -------------------------------------------------
if __name__ == "__main__":
    # 1) Start the trading/data bot that writes into ./data/*.json
    try:
        start_bot()
    except FileNotFoundError as e:
        # Log but still start API, so dashboard can show "no data" instead of crashing
        print(f"[main] Bot not started: {e}")

    # 2) Start the FastAPI server (HTTP + WebSockets)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
