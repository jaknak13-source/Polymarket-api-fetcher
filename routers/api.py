import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from file_cache import file_cache  # DATA_DIR is already used inside file_cache

router = APIRouter()

@router.get("/trades/recent")
def get_trades_recent():
    # Use logical filename; file_cache already knows DATA_DIR
    data = file_cache.get("trades_recent.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return JSONResponse(data)


@router.get("/trades/whales")
def get_trades_whales():
    data = file_cache.get("whales.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return JSONResponse(data)


@router.get("/traders/top")
def get_traders_top():
    data = file_cache.get("traders_top.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return JSONResponse(data)


@router.get("/markets")
def get_markets():
    data = file_cache.get("markets_stats.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return JSONResponse(data)


@router.get("/markets/{market}")
def get_market_data(market: str):
    data = file_cache.get("markets_stats.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")

    # If markets_stats is a dict keyed by market id:
    if isinstance(data, dict):
        market_obj = data.get(market)
    else:
        # If it's a list, look up by id field
        market_obj = next((m for m in data if m.get("id") == market), None)

    if not market_obj:
        raise HTTPException(404, f"Market '{market}' not found.")

    return JSONResponse(market_obj)


@router.get("/orderflow")
def get_orderflow():
    data = file_cache.get("orderflow.json")
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return JSONResponse(data)


@router.get("/full/sorted")
def get_full_sorted():
    # Bot writes full_trades_sorted.txt (CSV content with ; delimiter)
    data = file_cache.get("full_trades_sorted.txt", raw=True)
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return PlainTextResponse(data, media_type="text/csv")


@router.get("/full/chrono")
def get_full_chrono():
    # Bot writes full_trades_chrono.txt
    data = file_cache.get("full_trades_chrono.txt", raw=True)
    if data is None:
        raise HTTPException(404, "File not found or not loaded.")
    return PlainTextResponse(data, media_type="text/csv")
