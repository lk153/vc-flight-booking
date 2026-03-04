# Vietnam Domestic Flight - Best Price Finder

## 1. Project Overview

A web application that aggregates and compares domestic flight prices across **all Vietnamese airlines**, helping users find the cheapest fares for any given route and date.

### Goals

- Search & compare prices from all Vietnam domestic airlines in one place
- Display results sorted by price, with filters for time, stops, and airline
- Show price trends / historical data to help users pick the best booking time
- Send price alerts when fares drop below a user-defined threshold

---

## 2. Vietnamese Airlines Coverage

| # | Airline | Code | Type | Data Source Strategy |
|---|---------|------|------|---------------------|
| 1 | **Vietnam Airlines** | VN | Full-service (flag carrier) | Amadeus API / Duffel API |
| 2 | **Vietjet Air** | VJ | Low-cost carrier | Amadeus API / SerpApi (Google Flights) |
| 3 | **Bamboo Airways** | QH | Full-service | Amadeus API / SerpApi |
| 4 | **Vietravel Airlines** | VU | Budget/hybrid | SerpApi (Google Flights) / Web scraping fallback |
| 5 | **Pacific Airlines** | BL | Low-cost (VN Airlines subsidiary) | Amadeus API (Sabre GDS) |
| 6 | **VASCO** | 0V | Regional (VN Airlines subsidiary) | SerpApi / Web scraping fallback |

---

## 3. Major Domestic Routes

### Tier 1 - Trunk Routes (highest demand)

| Route | Code | ~Annual Passengers |
|-------|------|--------------------|
| Hanoi - Ho Chi Minh City | HAN-SGN | 11M+ |
| Da Nang - Hanoi | DAD-HAN | 2.9M |
| Da Nang - Ho Chi Minh City | DAD-SGN | 2.9M |

### Tier 2 - High Volume

| Route | Code |
|-------|------|
| Ho Chi Minh City - Phu Quoc | SGN-PQC |
| Hai Phong - Ho Chi Minh City | HPH-SGN |
| Ho Chi Minh City - Vinh | SGN-VII |
| Hue - Ho Chi Minh City | HUI-SGN |
| Hanoi - Nha Trang (Cam Ranh) | HAN-CXR |

### Tier 3 - Medium Volume

SGN-THD, HAN-PQC, DLI-HAN, CXR-SGN, SGN-UIH, HAN-VCA, SGN-VCL, SGN-VCS, DLI-SGN, HAN-HUI, HAN-VDH, SGN-VDH

### All Vietnam Domestic Airports (22 airports)

```
HAN  Hanoi (Noi Bai)          SGN  Ho Chi Minh City       DAD  Da Nang
CXR  Nha Trang / Cam Ranh     PQC  Phu Quoc               HPH  Hai Phong
HUI  Hue                      VCA  Can Tho                 VII  Vinh
DLI  Da Lat                   VDH  Dong Hoi                VCS  Con Dao
UIH  Quy Nhon (Phu Cat)       THD  Thanh Hoa               VCL  Chu Lai
TBB  Tuy Hoa                  PXU  Pleiku                  BMV  Buon Ma Thuot
DIN  Dien Bien Phu            VKG  Rach Gia                CAH  Ca Mau
HBN  Phan Thiet (upcoming)
```

---

## 4. Data Source Strategy (Multi-Layer)

### Layer 1 - Primary: Amadeus Self-Service API (FREE tier)

- **Coverage:** Vietnam Airlines, Vietjet, Bamboo Airways, Pacific Airlines via GDS
- **Free tier:** 2,000 Flight Offers Search / month, 3,000 Flight Offers Price / month
- **SDK:** Official Python (`amadeus`) and Node.js packages
- **Docs:** https://developers.amadeus.com

### Layer 2 - Secondary: SerpApi Google Flights

- **Coverage:** All airlines that appear on Google Flights (including Vietravel, VASCO)
- **Pricing:** 100 searches/month free trial, paid plans from $50/month
- **Benefit:** Catches LCC fares that may not appear in GDS; provides price insights
- **Docs:** https://serpapi.com/google-flights-api

### Layer 3 - Fallback: Web Scraping (Playwright)

- **Target:** Individual airline websites for carriers missing from APIs
- **Use sparingly:** Only for Vietravel Airlines and VASCO if not in API results
- **Tech:** Playwright (headless Chromium) with proxy rotation
- **Risk:** Fragile, may break; legal gray area - use as last resort

### Future Expansion

- **Skyscanner API** (requires partner application)
- **Duffel API** (if booking functionality is added)
- **Traveloka Partners Network** (strongest SE Asia coverage)

---

## 5. Tech Stack

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│         Next.js 14+ (App Router, RSC)            │
│         TypeScript + Tailwind CSS                │
│         shadcn/ui (clean component library)      │
│         Framer Motion (smooth animations)        │
│         React Query (TanStack Query)             │
│         date-fns for date handling               │
│         Recharts for price trend charts          │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                    Backend                       │
│         Next.js API Routes / Route Handlers      │
│         TypeScript                               │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐  │
│  │ Amadeus SDK │  │ SerpApi SDK  │  │Playwright│ │
│  │ (primary)   │  │ (secondary)  │  │(fallback)│ │
│  └─────────────┘  └──────────────┘  └────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                  Database & Cache                 │
│         PostgreSQL (Neon / Supabase)              │
│         - Search history & price snapshots        │
│         - User accounts & alerts                  │
│         Redis (Upstash)                           │
│         - Flight search result caching (30 min)   │
│         - Rate limiting                           │
│         Prisma ORM                                │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│               Background Jobs                    │
│         Cron (Vercel Cron / node-cron)           │
│         - Price monitoring every 4 hours          │
│         - Price alert email notifications         │
│         - Historical price data collection        │
└─────────────────────────────────────────────────┘
```

---

## 6. Database Schema

```sql
-- Airports reference table
CREATE TABLE airports (
  iata_code  VARCHAR(3) PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  is_international BOOLEAN DEFAULT FALSE
);

-- Airlines reference table
CREATE TABLE airlines (
  iata_code  VARCHAR(2) PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(20) NOT NULL,  -- 'full-service', 'low-cost', 'regional'
  logo_url   VARCHAR(255)
);

-- Cached search results
CREATE TABLE flight_searches (
  id              SERIAL PRIMARY KEY,
  origin          VARCHAR(3) NOT NULL REFERENCES airports(iata_code),
  destination     VARCHAR(3) NOT NULL REFERENCES airports(iata_code),
  departure_date  DATE NOT NULL,
  return_date     DATE,
  searched_at     TIMESTAMP DEFAULT NOW(),
  results_json    JSONB NOT NULL
);

-- Historical price snapshots (for trend analysis)
CREATE TABLE price_snapshots (
  id              SERIAL PRIMARY KEY,
  origin          VARCHAR(3) NOT NULL,
  destination     VARCHAR(3) NOT NULL,
  departure_date  DATE NOT NULL,
  airline_code    VARCHAR(2) NOT NULL,
  price_vnd       INTEGER NOT NULL,
  flight_number   VARCHAR(10),
  departure_time  TIME,
  arrival_time    TIME,
  recorded_at     TIMESTAMP DEFAULT NOW()
);

-- User price alerts
CREATE TABLE price_alerts (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255),
  origin          VARCHAR(3) NOT NULL,
  destination     VARCHAR(3) NOT NULL,
  departure_date  DATE NOT NULL,
  max_price_vnd   INTEGER NOT NULL,
  notify_email    BOOLEAN DEFAULT FALSE,
  notify_push     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  triggered_at    TIMESTAMP
);

-- Browser push subscriptions
CREATE TABLE push_subscriptions (
  id              SERIAL PRIMARY KEY,
  alert_id        INTEGER REFERENCES price_alerts(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL UNIQUE,
  p256dh_key      TEXT NOT NULL,
  auth_key        TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_price_snapshots_route ON price_snapshots(origin, destination, departure_date);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_flight_searches_route ON flight_searches(origin, destination, departure_date);
CREATE INDEX idx_push_subscriptions_alert ON push_subscriptions(alert_id);
```

---

## 7. Project Structure

```
vc-flight-booking/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (search form)
│   │   ├── search/
│   │   │   └── page.tsx              # Search results page
│   │   ├── trends/
│   │   │   └── page.tsx              # Price trends page
│   │   ├── alerts/
│   │   │   └── page.tsx              # Price alerts management
│   │   └── api/
│   │       ├── flights/
│   │       │   ├── search/route.ts   # GET - Search flights
│   │       │   └── prices/route.ts   # GET - Price history
│   │       ├── alerts/
│   │       │   ├── route.ts          # POST/GET - Manage alerts
│   │       │   └── [id]/route.ts     # DELETE - Remove alert
│   │       └── cron/
│   │           └── check-prices/route.ts  # Cron job endpoint
│   │
│   ├── components/
│   │   ├── search/
│   │   │   ├── SearchForm.tsx        # Airport picker + date picker
│   │   │   ├── AirportSelect.tsx     # Autocomplete airport input
│   │   │   └── DatePicker.tsx        # Departure/return date picker
│   │   ├── results/
│   │   │   ├── FlightCard.tsx        # Single flight result card
│   │   │   ├── FlightList.tsx        # Sorted list of results
│   │   │   ├── FilterBar.tsx         # Airline, time, stops filters
│   │   │   └── PriceSort.tsx         # Sort by price/time/airline
│   │   ├── trends/
│   │   │   ├── PriceChart.tsx        # Historical price line chart
│   │   │   └── PriceCalendar.tsx     # Calendar heatmap of prices
│   │   ├── alerts/
│   │   │   ├── AlertForm.tsx         # Create price alert form
│   │   │   ├── AlertList.tsx         # List of active alerts
│   │   │   └── PushToggle.tsx        # Enable/disable browser push toggle
│   │   └── ui/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Loading.tsx
│   │
│   ├── lib/
│   │   ├── providers/                # Flight data providers
│   │   │   ├── types.ts              # Shared FlightOffer interface
│   │   │   ├── amadeus.ts            # Amadeus API client
│   │   │   ├── serpapi.ts            # SerpApi Google Flights client
│   │   │   ├── scraper.ts            # Playwright scraper (fallback)
│   │   │   └── aggregator.ts         # Merge & deduplicate results
│   │   ├── db/
│   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   └── queries.ts            # Database query helpers
│   │   ├── cache.ts                  # Redis caching layer
│   │   ├── email.ts                  # Email notifications (Resend)
│   │   ├── push.ts                   # Web Push notification sender (web-push)
│   │   ├── notifications.ts          # Unified notify (email + push dispatcher)
│   │   ├── airports.ts               # Vietnam airports data
│   │   └── utils.ts                  # Formatting, currency, etc.
│   │
│   └── types/
│       └── index.ts                  # Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma                 # Prisma schema
│   └── seed.ts                       # Seed airports & airlines data
│
├── public/
│   ├── sw.js                         # Service Worker for push notifications
│   └── airlines/                     # Airline logo images
│       ├── VN.png
│       ├── VJ.png
│       ├── QH.png
│       ├── VU.png
│       ├── BL.png
│       └── 0V.png
│
├── .env.local                        # API keys (not committed)
├── .env.example                      # Template for env vars
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── prisma/schema.prisma
└── Plan.MD                           # This file
```

---

## 8. Core Data Flow

```
User submits search (origin, destination, date)
         │
         ▼
   Check Redis cache (key: "HAN-SGN-2026-03-15")
         │
    ┌────┴─────┐
    │ HIT      │ MISS
    │          ▼
    │   Query all providers in parallel:
    │   ┌──────────────────────────┐
    │   │ Promise.allSettled([     │
    │   │   amadeus.search(),      │
    │   │   serpapi.search(),      │
    │   │   scraper.search(),      │  ← only if needed
    │   │ ])                       │
    │   └──────────┬───────────────┘
    │              ▼
    │   Aggregator: merge, deduplicate, normalize
    │              │
    │              ▼
    │   Store in Redis cache (TTL: 30 min)
    │   Store price snapshot in PostgreSQL
    │              │
    └──────┬──────┘
           ▼
   Return sorted results to frontend
         │
         ▼
   Display FlightList with FilterBar
```

---

## 9. UI/UX Design Principles

### Design Philosophy: Clean, Bright & Effortless

The app should feel like a **premium travel companion** — minimal clutter, generous whitespace, and information presented at a glance. Users should be able to search and compare prices within seconds.

### Color Palette

```
Primary:      #2563EB  (Blue 600)       — trust, travel, sky
Primary Light:#DBEAFE  (Blue 100)       — backgrounds, highlights
Accent:       #F59E0B  (Amber 500)      — best price badges, CTAs
Success:      #10B981  (Emerald 500)    — price drops, savings
Danger:       #EF4444  (Red 500)        — price increases, alerts
Background:   #F8FAFC  (Slate 50)       — page background
Surface:      #FFFFFF                    — cards, panels
Text Primary: #0F172A  (Slate 900)      — headings
Text Secondary:#64748B (Slate 500)      — labels, captions
```

### Typography

- **Font:** Inter (clean, modern, excellent readability)
- **Headings:** Semi-bold (600), tracking tight
- **Body:** Regular (400), 16px base
- **Prices:** Bold (700), slightly larger — prices are the hero element

### Layout Principles

- **Mobile-first** responsive design (320px → 1280px)
- **Max content width:** 1120px, centered
- **Card-based layout** with subtle shadows (`shadow-sm`) and rounded corners (`rounded-xl`)
- **Generous spacing:** 24-32px between sections, 16px card padding
- **No visual noise:** Minimal borders, use whitespace to separate elements

### Component Library: shadcn/ui

Pre-built accessible components, customized to match the bright theme:
- `Button`, `Input`, `Select`, `DatePicker`, `Dialog`, `Toast`, `Badge`, `Skeleton`
- All components styled with Tailwind — no extra CSS files

### Micro-Interactions (Framer Motion)

- Search form → results: smooth slide-up transition
- Flight cards: staggered fade-in on load
- Price badge: subtle pulse animation on "Best Price"
- Filter toggle: smooth expand/collapse
- Skeleton loaders while fetching (not spinners)

---

## 10. Key Features & Pages

### Page 1: Home / Search (/)

```
┌──────────────────────────────────────────────────────────┐
│  ☁  VN Flight Finder                          [Alerts]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│         Find the cheapest domestic flights               │
│         across all Vietnamese airlines                   │
│                                                          │
│  ┌─────────────┐  ⇄  ┌─────────────┐  ┌────────────┐   │
│  │ From: HAN ▼ │     │ To: SGN  ▼  │  │ 15 Mar  📅 │   │
│  └─────────────┘     └─────────────┘  └────────────┘   │
│                                                          │
│  Passengers: [1 ▼]          [ 🔍 Search Flights ]       │
│                                                          │
│  ── Popular Routes ──────────────────────────────────    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ HAN→SGN  │  │ DAD→SGN  │  │ SGN→PQC  │               │
│  │ from 850k│  │ from 620k│  │ from 490k│               │
│  └──────────┘  └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────┘
```

- **Airport selector:** Autocomplete dropdown with city name + IATA code + airport name
- **Swap button (⇄):** One-click to reverse origin/destination
- **Date picker:** Clean calendar with price hints per day (color-coded)
- **Popular routes:** Cards showing lowest recent price, clickable to pre-fill search

### Page 2: Search Results (/search)

```
┌──────────────────────────────────────────────────────────┐
│  HAN → SGN  •  15 Mar 2026  •  1 passenger     [Edit]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Best prices:  VJ 850k  │  VN 1.2M  │  QH 980k         │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  Sort: [Cheapest ▼]   Filter: [All airlines ▼] [Time ▼] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🏷️ BEST PRICE                                     │  │
│  │ [VJ logo]  Vietjet Air  VJ 133                    │  │
│  │ 06:00 HAN ────── 2h 10m ────── 08:10 SGN         │  │
│  │                                          850,000đ  │  │
│  │                              [🔔 Alert] [→ Book]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [QH logo]  Bamboo Airways  QH 245                 │  │
│  │ 08:30 HAN ────── 2h 05m ────── 10:35 SGN         │  │
│  │                                          980,000đ  │  │
│  │                              [🔔 Alert] [→ Book]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [VN logo]  Vietnam Airlines  VN 201               │  │
│  │ 10:00 HAN ────── 2h 00m ────── 12:00 SGN         │  │
│  │                                        1,200,000đ  │  │
│  │                              [🔔 Alert] [→ Book]  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- **Price summary bar:** Quick glance at cheapest per airline (color-coded badges)
- **"BEST PRICE" badge:** Amber highlight on the cheapest flight
- **Flight cards:** Clean horizontal layout — airline, times, duration, price
- **Book button:** Links directly to the airline's booking page
- **Alert button:** One-click to set a price drop alert for that route
- **Empty state:** Friendly illustration + "No flights found, try different dates"

### Page 3: Price Trends (/trends)

```
┌──────────────────────────────────────────────────────────┐
│  Price Trends  •  HAN → SGN                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 30-Day Price History                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │    1.4M ┤                                          │  │
│  │    1.2M ┤──── VN ────                              │  │
│  │    1.0M ┤         ╲  ╱── QH ──                     │  │
│  │    850k ┤──────────── VJ ──────                    │  │
│  │         └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──→        │  │
│  │           Feb 1    Feb 15    Mar 1                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📅 Cheapest Days to Fly (next 30 days)                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Mo  Tu  We  Th  Fr  Sa  Su                        │  │
│  │  🟢  🟢  🟡  🟡  🔴  🔴  🟡   ← color = price    │  │
│  │  850 870 950 980 1.3 1.4 990   ← price in 000đ    │  │
│  │  ...                                               │  │
│  └────────────────────────────────────────────────────┘  │
│  🟢 < 900k   🟡 900k-1.1M   🔴 > 1.1M                  │
│                                                          │
│  💡 Best time to book: Tue-Wed, 3-4 weeks in advance    │
└──────────────────────────────────────────────────────────┘
```

- **Line chart:** Multi-airline overlay with distinct colors, hover tooltips
- **Calendar heatmap:** Green/yellow/red tiles showing cheapest price per day
- **Booking tip:** AI-style recommendation based on historical patterns

### Page 4: Price Alerts (/alerts)

```
┌──────────────────────────────────────────────────────────┐
│  My Price Alerts                        [+ New Alert]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  HAN → SGN  •  15 Mar 2026                        │  │
│  │  Alert when price drops below 900,000đ             │  │
│  │  Current best: 950,000đ (VJ)                       │  │
│  │  Notify via: [✅ Browser] [✅ Email]               │  │
│  │                              [Pause]  [Delete]     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  SGN → PQC  •  20 Mar 2026                        │  │
│  │  Alert when price drops below 500,000đ             │  │
│  │  Current best: 480,000đ (VJ) ✅ TRIGGERED          │  │
│  │  Notify via: [✅ Browser] [◻ Email]                │  │
│  │                              [Pause]  [Delete]     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🔔 Browser notifications: Enabled ✅                    │
│     [Disable notifications]                              │
└──────────────────────────────────────────────────────────┘
```

- **Alert cards:** Show route, threshold, current best price, and status
- **Triggered badge:** Green highlight when price is already below threshold
- **Notification toggles:** Per-alert choice of browser push and/or email
- **Global push toggle:** Enable/disable browser notifications at the bottom
- **Empty state:** "No alerts yet — search for a flight and tap 🔔 to get started"

#### Browser Push Notification Flow

```
User clicks "Enable notifications"
         │
         ▼
  Browser requests Notification permission
         │
    ┌────┴─────┐
    │ GRANTED  │ DENIED → show fallback (email-only)
    │          │
    ▼          │
  Service Worker registers
  PushManager.subscribe() → generates push subscription
         │
         ▼
  POST /api/alerts/subscribe → store subscription in DB
         │
         ▼
  Cron job detects price drop below threshold
         │
         ▼
  Server sends push via web-push library
         │
         ▼
  Service Worker receives push event → shows notification
  "✈ HAN→SGN dropped to 850,000đ (was 1,200,000đ)"
         │
         ▼
  User clicks notification → opens app at /search?...
```

---

## 10. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights/search?origin=HAN&dest=SGN&date=2026-03-15&pax=1` | Search flights |
| GET | `/api/flights/prices?origin=HAN&dest=SGN&from=2026-03-01&to=2026-03-31` | Price history |
| POST | `/api/alerts` | Create price alert |
| GET | `/api/alerts?email=user@email.com` | List user's alerts |
| DELETE | `/api/alerts/:id` | Delete an alert |
| POST | `/api/alerts/subscribe` | Save browser push subscription |
| DELETE | `/api/alerts/subscribe` | Remove push subscription |
| POST | `/api/cron/check-prices` | Cron: check alerts & send push/email |

---

## 11. Environment Variables

```env
# Amadeus API (free tier)
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret

# SerpApi (Google Flights)
SERPAPI_KEY=your_serpapi_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/vc_flights

# Redis Cache
REDIS_URL=redis://...

# Email (Resend)
RESEND_API_KEY=your_resend_key

# Web Push (VAPID keys - generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
```

---

## 12. Implementation Phases

### Phase 1 - MVP (Week 1-2)

1. **Project setup:** Next.js + TypeScript + Tailwind + Prisma
2. **UI foundation:** shadcn/ui init, Inter font, color palette, global styles
3. **Amadeus integration:** Flight search with free tier
4. **Home page:** Airport autocomplete, date picker, swap button, popular routes
5. **Results page:** Flight cards with airline logos, "BEST PRICE" badge, skeleton loaders
6. **Redis caching:** Cache search results for 30 minutes

**Deliverable:** Working search with clean UI that returns real flight prices from Amadeus.

### Phase 2 - Multi-Source & Comparison (Week 3)

6. **SerpApi integration:** Add Google Flights as secondary source
7. **Aggregator:** Merge results from multiple sources, deduplicate
8. **Filters & sorting:** Airline filter, time filter, price sort
9. **Price comparison bar:** Visual comparison across airlines

**Deliverable:** Multi-source price comparison with filtering.

### Phase 3 - Trends & Alerts (Week 4)

10. **Price history:** Store snapshots, build trend charts
11. **Calendar view:** Price heatmap for flexible date search
12. **Browser push notifications:** Service Worker + Web Push API + VAPID keys
13. **Email notifications:** Resend integration as secondary channel
14. **Unified notification dispatcher:** Send via push, email, or both based on user preference
15. **Cron jobs:** Automated price monitoring every 4 hours, trigger notifications

**Deliverable:** Full-featured app with trends, browser push alerts, and email alerts.

### Phase 4 - Polish & Deploy (Week 5)

14. **Responsive design:** Mobile-first optimization
15. **SEO:** Meta tags, structured data for routes
16. **Error handling:** Graceful fallbacks when APIs fail
17. **Rate limiting:** Protect API endpoints
18. **Deploy:** Vercel (frontend + API) + Neon (PostgreSQL) + Upstash (Redis)

**Deliverable:** Production-ready deployment.

### Phase 5 - Future Enhancements (Optional)

- User accounts with search history
- Scraping fallback for Vietravel/VASCO
- Multi-city / round-trip search
- Fare class comparison (economy vs business)
- Telegram/Zalo bot for price alerts
- PWA with push notifications
- Integration with Skyscanner or Traveloka APIs

---

## 13. Cost Estimate (Monthly)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|-------------------|
| **Amadeus API** | 2,000 searches/month | Pay-per-use beyond |
| **SerpApi** | 100 searches/month trial | $50/month (5,000 searches) |
| **Vercel** | Hobby plan (free) | Pro $20/month |
| **Neon PostgreSQL** | Free tier (0.5 GB) | $19/month |
| **Upstash Redis** | Free tier (10K commands/day) | $10/month |
| **Resend Email** | 3,000 emails/month | $20/month |
| **Total (MVP)** | **$0** | **~$120/month at scale** |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Amadeus free tier limit (2K/month) | Search stops working | Aggressive caching (30 min TTL); fallback to SerpApi |
| LCC fares missing from GDS | Incomplete Vietjet/Vietravel prices | SerpApi covers Google Flights data; scraping as last resort |
| API response latency | Slow search experience | Parallel API calls; Redis cache; loading skeleton UI |
| Scraping breaks | Fallback data source fails | Scraping is optional; primary sources are stable APIs |
| Flight data inaccuracy | Users see wrong prices | Display "prices are indicative" disclaimer; link to airline for booking |
| Rate limiting by providers | Temporary service disruption | Exponential backoff; request queuing; cache heavily |

---

## 15. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "typescript": "^5.x",
    "@prisma/client": "^5.x",
    "amadeus": "^9.x",
    "serpapi": "^2.x",
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^11.x",
    "recharts": "^2.x",
    "date-fns": "^3.x",
    "resend": "^3.x",
    "web-push": "^3.x",
    "ioredis": "^5.x",
    "tailwindcss": "^3.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "playwright": "^1.x"
  }
}
```

---

## Quick Start Commands

```bash
# 1. Create the project
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# 2. Install dependencies
npm install amadeus serpapi @prisma/client @tanstack/react-query framer-motion recharts date-fns resend web-push ioredis zod
npm install -D prisma playwright

# 3. Initialize shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input select dialog toast badge skeleton popover calendar

# 4. Initialize Prisma
npx prisma init

# 5. Set up env vars
cp .env.example .env.local

# 6. Run database migrations
npx prisma migrate dev

# 7. Seed airports & airlines data
npx prisma db seed

# 8. Start development
npm run dev
```