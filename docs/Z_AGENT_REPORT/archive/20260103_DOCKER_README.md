# Eduanima Frontend Docker Guide

## Prerequisites
- Docker Desktop running with WSL2 integration enabled (if on Windows)
- Port `5173` free on the host

## Usage
- Start (cached build): `docker compose up`
- Rebuild + start: `docker compose up --build`
- Stop: `docker compose down`

## Notes
- The app listens on `http://localhost:5173` and `0.0.0.0:5173` for container access.
- HMR: edit a file such as `src/App.tsx`; the browser should update automatically.
- Environment variables: place a `.env` file in the project root if needed—Compose will load it automatically.
- If logs show `spawn xdg-open ENOENT`, it is Vite trying to auto-open a browser; you can ignore it or disable `open` in `vite.config.ts`.
