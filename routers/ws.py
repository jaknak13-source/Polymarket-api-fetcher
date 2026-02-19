import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from file_cache import file_cache  # uses DATA_DIR and MONITOR_FILES from file_cache.py

router = APIRouter()

TRADES_RECENT_FILE = "trades_recent.json"


@router.websocket("/ws/trades")
async def stream_trades_recent(websocket: WebSocket) -> None:
    """
    Streams the contents of trades_recent.json via WebSocket.
    Sends only when the file version changes in FileCache.
    """
    await websocket.accept()
    last_version = None

    try:
        while True:
            # FileCache works with logical file names (not full paths)
            file_data, version = file_cache.get_versioned(TRADES_RECENT_FILE)

            # Only send when there is fresh data and a new version
            if version != last_version and file_data is not None:
                if isinstance(file_data, str):
                    payload = file_data
                else:
                    payload = file_cache.dumps(file_data)

                await websocket.send_text(payload)
                last_version = version

            # Poll once per second
            await asyncio.sleep(1)

    except WebSocketDisconnect:
        # Client disconnected, just stop this handler
        pass

    except Exception as e:
        # Log unexpected errors instead of crashing the server
        print(f"[WS] Error in /ws/trades: {e}")
