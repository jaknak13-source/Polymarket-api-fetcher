// src/config.ts (or wherever you define API_BASE)

const hostname = window.location.hostname;

const isLocalhost =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]"; // IPv6 localhost [web:110][web:119]

export const API_BASE = isLocalhost
  ? "http://127.0.0.1:8000"     // when you open the site via localhost
  : "http://your-ip:8001"; // when opened from any other host / domain

