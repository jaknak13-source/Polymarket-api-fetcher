import os
import time
import json
import threading
import atexit

# Absolute data dir, shared with bot.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

MONITOR_FILES = [
    "trades_recent.json",
    "whales.json",
    "traders_top.json",
    "markets_stats.json",
    "orderflow.json",
    "full_trades_sorted.txt",
    "full_trades_chrono.txt",
]


class FileCache:
    def __init__(self, data_dir: str, files: list[str]):
        self.data_dir = data_dir
        self.files = files
        self._data: dict[str, object] = {}
        self._mtimes: dict[str, float] = {}
        self._lock = threading.Lock()
        self._versions: dict[str, str] = {}
        self._stop_event = threading.Event()
        self._watcher_thread = threading.Thread(
            target=self._watch_files, daemon=True
        )
        self._watcher_thread.start()
        atexit.register(self.stop_watcher)

    def stop_watcher(self) -> None:
        """Gracefully stop the file watcher."""
        self._stop_event.set()
        if hasattr(self, "_watcher_thread"):
            self._watcher_thread.join(timeout=2)

    def _watch_files(self) -> None:
        """Watch files for changes with error handling."""
        while not self._stop_event.is_set():
            for fname in self.files:
                path = os.path.join(self.data_dir, fname)
                try:
                    if os.path.exists(path):
                        mtime = os.path.getmtime(path)
                        prev_mtime = self._mtimes.get(fname, 0.0)

                        # Only reload if newer
                        if mtime > prev_mtime:
                            self._load_file(fname, path)
                            with self._lock:
                                self._mtimes[fname] = mtime
                                # millisecond version, good for WS diffing
                                self._versions[fname] = str(int(mtime * 1000))
                            print(f"[FileCache] Reloaded {fname}")
                except (OSError, FileNotFoundError):
                    # File may disappear while checking; just skip
                    continue
                except Exception as e:
                    print(f"[FileCache] Error watching {fname}: {e}")
                    continue

            # Sleep with timeout check
            if self._stop_event.wait(timeout=1):
                break

    def _load_file(self, fname: str, path: str) -> None:
        """Load file with comprehensive error handling."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            if fname.endswith(".json"):
                # Validate JSON before parsing
                try:
                    data = json.loads(content)
                    with self._lock:
                        self._data[fname] = data
                except json.JSONDecodeError:
                    print(f"[FileCache] Invalid JSON in {fname}, skipping")
                    with self._lock:
                        self._data[fname] = None
            else:
                # Text file - store as string
                with self._lock:
                    self._data[fname] = content

        except (UnicodeDecodeError, PermissionError) as e:
            print(f"[FileCache] File read error {fname}: {e}")
            with self._lock:
                self._data[fname] = None
        except Exception as e:
            print(f"[FileCache] Unexpected error loading {fname}: {e}")
            with self._lock:
                self._data[fname] = None

    def get(self, fname: str, default=None, raw: bool = False):
        """
        Get cached data.
        raw=True forces raw string return even for JSON files.
        """
        with self._lock:
            val = self._data.get(fname, default)
            if raw or fname.endswith(".txt"):
                return val
            return val

    def get_versioned(self, fname: str, default=None):
        """Returns (data, version) tuple for websocket versioning."""
        with self._lock:
            data = self._data.get(fname, default)
            version = self._versions.get(fname)
            return data, version

    def invalidate(self, fname: str) -> None:
        """Force reload a specific file immediately."""
        path = os.path.join(self.data_dir, fname)
        if os.path.exists(path):
            self._load_file(fname, path)

    def clear(self) -> None:
        """Clear all cache."""
        with self._lock:
            self._data.clear()
            self._mtimes.clear()
            self._versions.clear()

    @staticmethod
    def dumps(obj) -> str:
        """Safe JSON dump."""
        try:
            return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
        except (TypeError, ValueError):
            return ""
        except Exception:
            return '{"error":"serialization failed"}'


# Global instance used by routers-api.py and routers/ws.py
file_cache = FileCache(DATA_DIR, MONITOR_FILES)


if __name__ == "__main__":
    # Simple manual test
    print("FileCache started. Monitoring:", MONITOR_FILES)
    print("Data dir:", DATA_DIR)

    try:
        while True:
            time.sleep(5)
            with file_cache._lock:
                status = {k: v is not None for k, v in file_cache._data.items()}
            print("Cache status:", status)
    except KeyboardInterrupt:
        file_cache.stop_watcher()
        print("FileCache stopped.")
