# APIpublic.py
"""
Run the FastAPI app defined in main.py on port 8001,
reachable on your LAN as: http://<server-ip>:8001

Example endpoints:
- http://<server-ip>:8001/docs
- http://<server-ip>:8001/api/trades/recent
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",   # if your FastAPI app variable is `app` in main.py
        host="0.0.0.0",  # listen on all network interfaces
        port=8001,
        reload=False,
    )

