# Disaster Intelligence — Multisource Disaster Management Intelligence System
### Smart India Hackathon (SIH 2026) • Problem Statement ID: 26206 • Software • Disaster Management

> **"Reliable information when every second matters."**  
> An emergency-ready, trustworthy, calm, operational, map-first disaster management intelligence platform built to eliminate information fragmentation during natural disasters (floods, building collapses, fires, cyclones).

---

## 🌟 Key Capabilities & Architecture

1. **Open-Source Map-First Situational Awareness (Leaflet.js & OpenStreetMap)**
   - Powered 100% by **Leaflet v1.9.4** and **OpenStreetMap (OSM)** — free, open-source, and independent of proprietary map APIs (no Google Maps API keys or billing required).
   - **Interactive Open-Source Tile Switcher**:
     - **OpenStreetMap Standard**: Official open-source community map tiles.
     - **OpenStreetMap Humanitarian (HOT)**: Specialized disaster relief and emergency response styling used by global humanitarian teams.
     - **OpenTopoMap**: Detailed topographic terrain and elevation contours for flood basin analysis.
     - **Carto Clean**: High-contrast neutral operations center theme matching `design.MD`.
   - **Flood Inundation Hazard Polygon Overlay**: Leaflet GeoJSON/polygon layer rendering river breach zones.
   - **Leaflet Scale & Metric Measurement**: Standard metric scale bar (`L.control.scale`).

2. **Front-Facing Role Selection Gateway & Role Session Locking**
   - When launching for the first time, users are presented with a dedicated onboarding gateway screen to choose their operational persona:
     - **Disaster Operations Coordinator** (District HQ Command Center)
     - **Citizen in Distress** (1-Touch SOS, Hazard Reporting, Shelters)
     - **Tactical Field Responder** (Unit assignment queue, status lifecycle update)
     - **NGO & Relief Volunteer** (Shelter capacity & food/water supply management)
   - **Immutable Session Role Locking**: Once confirmed, the role switcher dropdown is disabled and removed. The user cannot arbitrarily switch privileges during their emergency session. An explicit "Switch Role / Logout" option is provided with confirmation modal.

3. **Live Coordinates Tracking System (Real-Time GPS Telemetry)**
   - Integrates the browser Geolocation API (`navigator.geolocation.watchPosition`) with automated fallbacks and realistic telemetry.
   - **TopBar & Banner Telemetry**: Displays `📍 23.0284° N, 72.5719° E (±8m)` with an active green pulsing beacon.
   - **Leaflet Live Location Layer**: Displays a distinct glowing blue marker with accuracy radius circle representing the operator's live position.
   - **"Locate Me" Control**: Instantly flies and zooms to the user's live position.
   - **Automated Citizen SOS Dispatch**: SOS distress beacons automatically package the citizen's live GPS coordinates.

4. **Universal Mobile & Desktop Adaptability**
   - **Desktop**: Persistent 3-zone layout (TopBar, 240px Navigation Sidebar, flexible Map/data grids, 380px right detail drawer).
   - **Mobile / Tablet (< 1024px)**:
     - Header hamburger button toggles a slide-over mobile drawer with backdrop.
     - **Mobile Bottom Navigation Bar**: Quick touch access to *Overview*, *Live Map*, *Incidents*, and *SOS Queue*.
     - **Responsive Incident Detail Drawer**: Renders as an adaptive bottom sheet on mobile devices.
     - Tables support horizontal swipe and touch-friendly targets (minimum 44px).

3. **Citizen Emergency Portal ("DisasterSafe")**
   - **Giant 1-Touch SOS Button (min 64px)**: Transmits GPS coordinates and citizen contact details immediately to the operations room.
   - **SOS Confirmation Screen**: Displays SOS ID, time received, assigned units, and safety instructions.
   - **4-Step Citizen Reporting**: Fast flow: *What happened?* &rarr; *Where?* &rarr; *How many people?* &rarr; *Ground photo & submit*.
   - **Nearby Shelters**: Real-time vacancy, directions, and emergency contact numbers.

4. **Tactical Responder Field Terminal**
   - Unit selection (Rescue Team 4, Ambulance 02, etc.).
   - Fast status advancement: `Assigned` &rarr; `Arrived On Scene / In Progress` &rarr; `Evacuation Complete / Resolved`.

5. **Official Emergency Alerts (3-Step Safety Workflow)**
   - Strictly enforces: `Create Alert` &rarr; `Review Formatting` &rarr; `Confirm & Broadcast`.
   - Prevents accidental broadcasts and ensures clear citizen instructions.

6. **Multisource Ingestion & Data Adapter Health**
   - Displays status of 4 adapters:
     - **Weather Feed** (IMD / Open-Meteo) — ONLINE
     - **Disaster Feed** (GDACS & USGS) — ONLINE
     - **Government Feed** (NDMA / GSDMA) — DEGRADED (simulating realistic fallback)
     - **Citizen Reports Ingestion** — ONLINE
   - Core operations, citizen reports, and map rendering remain 100% functional even if external feeds fail.

7. **3-Minute SIH Demo Scenarios Controller**
   - One-click launcher in the top bar to showcase:
     - *Scenario 1: Rapid Flash Flood Surge* (injects 2 urgent citizen distress beacons).
     - *Scenario 2: Complete Operational Loop* (resolves Incident #104 and releases rescue teams).
     - *Scenario 3: External Feed Outage Resiliency* (demonstrates system survival during agency downtime).
     - *Scenario 4: Reset Demo State* (restores baseline clean dataset).

---

## 🎨 Design System Compliance (`design.MD`)

- **Color Tokens**:
  - Calm base background: `#F8FAFC`
  - Cards & surfaces: `#FFFFFF` with subtle slate borders (`#E2E8F0`)
  - Command sidebar: Deep Navy (`#0B1220`) and Navy 900 (`#111827`)
  - Primary blue: `#2563EB`
  - Severity tokens: Critical (`#DC2626`), High (`#EA580C`), Medium (`#F59E0B`), Low (`#16A34A`), Unverified (`#64748B`)
- **Typography**: Inter font with strong numeric weights for KPI cards.
- **Rule of Human Verification**: Unverified reports never convert to official alerts or verified incidents without coordinator review.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
`http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 👥 Persona Switching in the Prototype

Use the **Role Dropdown** in the top-right header to instantly switch between:
1. **Coordinator HQ** — Full operations command center with 3-zone layout and Live Map.
2. **Citizen Portal** — Mobile view with 1-touch SOS, hazard reporting, and nearby shelters.
3. **Field Responder** — Tactical unit terminal with status progression.
4. **NGO / Volunteer** — Focused view on relief shelters and food/water distribution.
