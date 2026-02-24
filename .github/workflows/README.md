# Digital Concierge – Reichshof Hamburg

## Overview
Digital Concierge is a hotel guest-assistance web app with room search, accessibility guidance, emergency evacuation plan loading, SOS support, voice interaction, QR workflows, and offline capability.

## Current Architecture
- `digital-concierge-reichshof.html`: Main UI structure.
- `css/style.css`: Main styling including SOS pulse, print layout, mic status badge.
- `js/script.js`: Frontend logic (search, voice, emergency viewer, dashboard, QR tools).
- `js/data/pdf-map.js`: Room-to-PDF registry (`window.hotelMapRegistry`) and Node export.
- `service-worker.js`: Offline cache strategy for app and evacuation PDFs.
- `server.js`: Express backend API + static hosting.
- `scripts/generate_qr_codes.js`: Batch QR image generator for rooms.

## Key Features Implemented
1. **Code Splitting**
   - Monolithic HTML logic/styles split into dedicated files (`css/style.css`, `js/script.js`).

2. **Emergency PDF System**
   - Room lookup -> evacuation plan URL resolution.
   - Backend fetch first (`/api/plan/:room`), local fallback via `hotelMapRegistry`.
   - Viewer elements: `#emergency-plan-container`, `#pdf-viewer`, `#safety-title`.

3. **SOS Integration**
   - Floating SOS button always visible.
   - Vibration SOS pattern.
   - Voice announcement + room highlight (`.sos-active-room`).
   - SOS panel with internal numbers.

4. **Voice Assistant**
   - Speech synthesis (`speakText`) in DE/EN/ES.
   - Speech recognition (`startListening`) via Web Speech API.
   - Live mic state badge (`MIC OFF` / `MIC ACTIVE`).

5. **QR Workflows**
   - Room-specific QR generation.
   - Reception QR generator + print flow.
   - Guest newspaper/magazine QR panel for `https://www.sharemagazines.de/lesen`.

6. **System Monitor**
   - Runtime status panel for:
     - PDF registry
      - Emergency viewer DOM
     - Service Worker state
     - Backend reachability
     - Last event tracking

7. **Offline Mode**
   - Service worker caches HTML/CSS/JS registry and evacuation PDFs.

## Backend API
### `GET /api/plan/:room`
Returns JSON:
```json
{
  "room": "318",
  "file": "3.og.pdf",
  "page": 11,
  "url": "/pdf/3.og.pdf#page=11"
}
```

### `GET /api/floor/:floor`
Returns requested floor SVG if available (`svg/<floor>.svg`).

## Run Locally
1. Install dependencies:
```bash
npm install
```
2. Start backend:
```bash
npm start
```
3. Open:
- `http://localhost:3000`

## Backup
Timestamped full backup zips are stored in:
- `backup/concierge_full_backup_YYYY-MM-DD_HH-mm-ss.zip`

## Notes
- If browser blocks microphone permissions, voice recognition cannot start.
- If backend is unavailable, frontend falls back to local `pdf-map` registry.
- Newspaper QR is generated dynamically in browser from the official URL.
