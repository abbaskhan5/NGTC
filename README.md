# NGTC ERP — Enterprise Transport & Multi-Business Management System

NGTC ERP is a centralized enterprise operations and transport management system built for Saudi Arabia-based multimodal transportation company **NGTC (Najd Global Transport & Contracting)**.

It provides a single unified dashboard and operations portal across six core business divisions:
1. **School Transportation** (K-12 student daily transit with stop tracking and speed governors)
2. **University Transportation** (Campus-to-campus and high-capacity luxury coach shuttles)
3. **Labor & Staff Transportation** (Industrial zones, compound transit, and workforce shifts)
4. **Corporate Transportation** (Executive VIP shuttles, commuter lines, and airport transfers)
5. **Construction Logistics** (Heavy haulage, tippers, equipment transport, and mega-project transit)
6. **Travel Agency & Tourism** (Umrah/Hajj chartered transport, domestic VIP tours, and package bookings)

---

## 1. Phase 1 Architecture & Capabilities

* **Full-Stack Monolithic Integration**: Express.js REST API with Vite middleware mounted in development (`server.ts`).
* **Enterprise Document Store**: High-performance indexed document store with MongoDB API semantics (`find`, `findOne`, `findById`, `insertOne`, `insertMany`, `updateOne`, `countDocuments`, compound indexes), with seamless support for MongoDB Atlas connection via `MONGODB_URI`.
* **RBAC (Role-Based Access Control)**: Granular permissions matrix (`resource.action`) across 7 enterprise roles:
  * Super Admin
  * General Manager / CEO
  * Fleet Manager
  * Operations Manager
  * Finance Manager
  * HR Manager
  * Driver / Operator
* **Live Operations Dashboard**:
  * Real-time KPIs (Total Fleet, Active Units, Drivers On-Duty, Today's Dispatched Trips, Active Contracts, Revenue SAR).
  * Business Division Performance cards with fleet allocation and monthly billing.
  * Recharts visual analytics: Monthly Revenue vs Operating Expenses (SAR), Fleet Readiness Status (Active/Idle/Maintenance/Inactive), and Daily Trip Dispatch Progress.
  * Compliance & Expiry Alert Center (Automated surveillance for insurance, Iqama, driving license, and MVPI inspection).
  * Live Operations & Audit Stream.
* **Global Fast-Index Search (`⌘K` / `Ctrl+K`)**:
  * Cross-entity indexing across Vehicles, Drivers, Contracts, Trips, and Invoices.
* **Real-Time Notification Drawer**:
  * Severity filtering (Urgent, Warning, Info), mark as read, and bulk acknowledge.
* **Traceable Audit Logging**:
  * Automatic ledger recording user ID, role, action, module, entity description, details, IP address, and timestamp.
* **Saudi Localization (KSA Ready)**:
  * SAR currency throughout.
  * English and Arabic (العربية) toggle with dynamic LTR/RTL layout switching.
  * Saudi branch structure: Riyadh Central HQ, Jeddah Western Hub, Dammam Eastern Hub, Makkah, and Madinah.
  * Saudi plate number formatting and Iqama number tracking.
* **Simulated Telemetry & Live GPS Map**:
  * Socket.IO ready architecture with speed, odometer, and coordinate monitoring.

---

## 2. Seed Accounts & Credentials

The system includes pre-seeded development accounts with standard development credentials:

| Role | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ngtc.sa` | `password123` | Full enterprise control across all branches & RBAC |
| **General Manager / CEO** | `manager@ngtc.sa` | `password123` | Executive oversight, contracts approval, financial P&L |
| **Fleet Manager** | `fleet@ngtc.sa` | `password123` | Fleet registry, maintenance schedules, vehicle status |
| **Operations Manager** | `operations@ngtc.sa` | `password123` | Route dispatch, trip execution, driver assignments |
| **Finance Manager** | `finance@ngtc.sa` | `password123` | Client invoices, operating expenses, VAT (15%) |
| **HR Manager** | `hr@ngtc.sa` | `password123` | Personnel records, Iqama tracking, attendance |
| **Driver / Field Operator** | `driver@ngtc.sa` | `password123` | Route execution, pre-trip status, passenger checks |

*Tip: You can switch between roles instantly via the **Persona Switcher** in the top navigation bar or the one-click buttons on the login screen.*

---

## 3. Project Structure

```text
ngtc-erp/
├── index.html                   # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                # AI Studio application metadata
├── package.json                 # Node dependencies and scripts
├── server.ts                    # Full-stack server entry point (Express + Vite middlewares)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler & Tailwind configuration
├── .env.example                 # Environment variable templates
│
├── server/                      # Express backend services
│   ├── db.ts                    # High-speed indexed document store with MongoDB API
│   ├── seed.ts                  # Enterprise seed data (24+ vehicles, 24+ drivers, contracts, trips)
│   ├── middleware/
│   │   └── auth.ts              # JWT signing, verification, RBAC permission checker, audit logger
│   └── routes/
│       ├── auth.ts              # Login, me, change-password, and demo switcher
│       ├── dashboard.ts         # Aggregated KPI & telemetry summary
│       ├── notifications.ts     # Expiry alerts and notification lifecycle
│       ├── auditLogs.ts         # Immutable audit trail query
│       ├── users.ts             # User management and RBAC role assignment
│       ├── vehicles.ts          # Fleet registration and dispatch states
│       ├── drivers.ts           # Driver compliance and onboarding
│       ├── contracts.ts         # Multi-project agreements and institutional contracts
│       ├── trips.ts             # Daily trip dispatch and live status updates
│       ├── search.ts            # Fast global index search (vehicles, drivers, contracts, trips)
│       └── seed.ts              # Database reset & re-seed endpoint
│
└── src/                         # React SPA frontend
    ├── main.tsx                 # Client entry point
    ├── App.tsx                  # Root application shell & router
    ├── index.css                # Global styling, Tailwind v4, custom scrollbars
    ├── types/
    │   ├── index.ts             # Core domain models (Vehicle, Driver, Contract, Trip, etc.)
    │   └── roles.ts             # Role definitions and granular permissions matrix
    ├── context/
    │   ├── AuthContext.tsx      # Auth state, login/logout, persona switching, RBAC `can()` helper
    │   └── LanguageContext.tsx  # Bilingual English/Arabic engine with LTR/RTL switching
    ├── services/
    │   └── api.ts               # Centralized typed fetch client with JWT injection
    └── components/
        ├── layout/
        │   ├── TopBar.tsx       # Strict 3-zone header: breadcrumb, ⌘K search, actions & persona
        │   └── Sidebar.tsx      # Permission-aware navigation with badge counters & branch indicator
        ├── dashboard/
        │   ├── ExecutiveDashboard.tsx  # Main executive dashboard
        │   ├── StatCard.tsx            # KPI metric card with tabular numerals
        │   ├── DivisionCard.tsx        # Business division status card
        │   ├── RevenueChart.tsx        # Recharts monthly revenue vs expenses area chart
        │   ├── FleetStatusChart.tsx    # Donut chart of fleet readiness
        │   ├── TripStatusBreakdown.tsx # Real-time dispatch progress bar
        │   ├── AlertsPanel.tsx         # Urgent expiry & compliance alert stream
        │   └── RecentActivityFeed.tsx  # Chronological audit feed
        ├── fleet/
        │   └── VehicleList.tsx         # Fleet table, Saudi plate filter, register modal
        ├── drivers/
        │   └── DriverList.tsx          # Driver directory, Iqama validity, safety scores
        ├── contracts/
        │   └── ContractList.tsx        # Institutional contracts in SAR, expiry tracking
        ├── trips/
        │   └── TripList.tsx            # Live route execution, dispatch state updates
        ├── gps/
        │   └── LiveGpsMap.tsx          # Real-time AVL telemetry and map visualization
        ├── users/
        │   └── UserManagement.tsx      # User accounts and RBAC access administration
        ├── audit/
        │   └── AuditLogViewer.tsx      # Enterprise audit log table with filter & search
        ├── search/
        │   └── GlobalSearchModal.tsx   # ⌘K Command palette search modal
        ├── notifications/
        │   └── NotificationDrawer.tsx  # Sliding notification drawer
        └── auth/
            └── LoginPage.tsx           # Corporate login page with quick demo selectors
```

---

## 4. REST API Endpoints (`/api/v1`)

### Authentication & Users
* `POST /api/v1/auth/login` — Authenticate user, returns JWT and user permissions
* `GET  /api/v1/auth/me` — Retrieve active profile and verified permissions
* `POST /api/v1/auth/switch-demo` — Switch persona role for development testing
* `POST /api/v1/auth/change-password` — Update user credentials
* `GET  /api/v1/users` — List all administrative users with branch and role details
* `POST /api/v1/users` — Provision new user account (Requires `users.manage`)
* `PUT  /api/v1/users/:id` — Update user status or role

### Operations & Dashboard
* `GET  /api/v1/dashboard/summary` — Full aggregated metrics (KPIs, divisions, charts, alerts, activity)
* `GET  /api/v1/search?q=:query` — Global multi-entity search across vehicles, drivers, contracts, trips

### Fleet & Transport
* `GET  /api/v1/vehicles` — Filter vehicles by status, type, branch, or plate search
* `POST /api/v1/vehicles` — Register vehicle with Saudi plate, VIN, and insurance dates
* `PUT  /api/v1/vehicles/:id` — Update vehicle assignment and status
* `GET  /api/v1/drivers` — List drivers with license and Iqama compliance dates
* `POST /api/v1/drivers` — Onboard new commercial driver
* `GET  /api/v1/contracts` — View active and expiring contracts
* `POST /api/v1/contracts` — Execute new institutional contract
* `GET  /api/v1/trips` — Daily trips roster with real-time status
* `POST /api/v1/trips/:id/status` — Dispatch, complete, or update trip status

### Compliance & Governance
* `GET  /api/v1/notifications` — Retrieve alerts with severity filter
* `PUT  /api/v1/notifications/:id/read` — Mark notification as acknowledged
* `PUT  /api/v1/notifications/read-all` — Bulk acknowledge all notifications
* `GET  /api/v1/audit-logs` — Immutable audit trail with module and IP filters
* `POST /api/v1/seed/reset` — Reset database with fresh Saudi enterprise seed records

---

## 5. Getting Started & Development

### Installation
```bash
npm install
```

### Run Full-Stack Development Server
```bash
npm run dev
```
The server will start on port `3000` with the Express API and mounted Vite SPA.

### Production Build
```bash
npm run build
npm start
```
