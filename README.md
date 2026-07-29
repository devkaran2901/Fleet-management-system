# FLEET MANAGEMENT SYSTEM —  TRAVERSE 

A comprehensive **Fleet Management System** built with NestJS 11 + Prisma 7 (backend), React 19 + Vite (frontend), and PostgreSQL 16. The system ships **8 full operational portals** — each with its own sidebar navigation, role guard, and module set — all under a unified design system.

---

## Tech Stack

| Layer    | Tech                                                                | Port   |
| -------- | ------------------------------------------------------------------- | ------ |
| Frontend | React 19, Vite, TypeScript, React Router 7, Axios, Lucide React    | `5173` |
| Backend  | NestJS 11, Prisma 7 (pg driver adapter), Passport JWT, bcrypt      | `3000` |
| Database | PostgreSQL 16 (Docker)                                              | `5433` |

---

## Prerequisites

- **Node.js 22+** and npm 10+ (`node -v`)
- **Docker Desktop** — for PostgreSQL

---

## Setup & Quickstart

Run these steps in order from a fresh clone:

### 1. Start PostgreSQL Container

```bash
cd database
docker compose up -d
```

Starts PostgreSQL 16 on host port **5433** (container `fms-postgres`), persisting data to the `fms-db-data` volume.

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

### 3. Database Migration & Seeding

```bash
cd backend
npm install
npx prisma db push       # syncs schema to PostgreSQL
npx prisma db seed       # seeds roles, users, org, rules, dispatch, compliance & workshop
```

### 4. Install Frontend

```bash
cd frontend
npm install
```

---

## Running the Application

Open two terminal windows:

```bash
# Terminal 1 — NestJS API (http://localhost:3000)
cd backend && npm run start:dev

# Terminal 2 — Vite React App (http://localhost:5173)
cd frontend && npm run dev
```

Open **<http://localhost:5173>** in your browser.

---

## System Architecture

```
FMS/
├── 01-Phase1-Domain-Research-and-Industry-Analysis.md
├── 02-Phase2-Business-Requirements-Document.md
├── 03-Phase3-Product-Requirements-Document.md
├── 04-Phase4-System-Design-Document.md
├── 05-Phase5-UIUX-Specification.md
├── 06-Phase6-Roadmap.md
├── MANUAL_TESTING_WORKFLOW.md
├── database/
│   └── docker-compose.yml          PostgreSQL 16 container
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           Full data model & relations
│   │   ├── seed.ts                 Idempotent main seed (roles, users, org, rules, dispatch, workshop)
│   │   └── seed-compliance.ts      Compliance role & user seed
│   └── src/
│       ├── auth/                   JWT auth, login endpoint, JwtAuthGuard, RolesGuard
│       ├── user/                   User profile & identity lookup
│       ├── admin/                  RBAC, Audit, Integrations, Rules services
│       ├── dispatcher/             Trip assignment, vehicle-driver match & ANPR queues
│       ├── finance/                Finance & payment services
│       ├── workshop/               Job cards, PM schedules & parts demand
│       └── prisma/                 PrismaService (shared DB client)
└── frontend/src/
    ├── context/                    AuthContext — session, active roles, JWT handling
    ├── services/                   api.ts, adminApi.ts, dispatcherApi.ts
    ├── styles/                     admin.css — shared design system tokens & layouts
    ├── components/
    │   ├── AppSidebar.tsx          Unified sidebar with 8-portal workspace switcher
    │   ├── CommandPalette.tsx      Global ⌘K command palette
    │   ├── ProtectedRoute.tsx      Role-guarded route wrapper
    │   ├── VelocityLogo.tsx        Branded SVG logo component
    │   └── admin/
    │       ├── LiveFleetMap.tsx    Real-time fleet map (Leaflet)
    │       └── ui.tsx              Shared admin UI primitives
    └── pages/
        ├── SignInPage.tsx          Login page with animated road scene & quick-fill buttons
        ├── admin/                  Admin Suite
        ├── dispatcher/             Dispatcher Workspace
        ├── fleet/                  Fleet Manager Portal
        ├── compliance/             Compliance Manager Portal
        ├── workshop/               Workshop Manager Portal
        ├── finance/                Finance Manager Portal
        ├── vendor/                 Vendor Portal
        ├── driver/                 Driver Portal
        └── custom/                 Custom Role Dashboard (capability-filtered)
```

---

## Portal Suites & Modules

### Admin Suite (`/admin/*`)

The super-user workspace. Admins can also switch into any other portal via the **Workspace Switcher** dropdown in the sidebar.

| Group          | Module                 | Route                              | Description |
| -------------- | ---------------------- | ---------------------------------- | ----------- |
| Overview       | Dashboard              | `/admin/dashboard`                 | System vitals, user, workflow & governance KPIs |
| Organization   | Org Tree               | `/admin/org`                       | Company hierarchy — regions, hubs, depots, teams |
|                | Cost Centers           | `/admin/cost-centers`              | Budget owners with utilisation tracking |
| User Access    | Users                  | `/admin/users`                     | People, stacked roles and account status |
|                | Roles                  | `/admin/roles`                     | Role builder with capability × scope matrix & SoD validator |
|                | Permissions            | `/admin/permissions`               | Effective access resolution & "can user X do Y?" simulator |
|                | Delegations            | `/admin/delegations`               | Time-boxed approval authority hand-offs |
| Workflow       | Rule Packs             | `/admin/rule-packs`                | Versioned, effective-dated compliance rules |
|                | Approval Flows         | `/admin/approval-flows`            | Visual chain builder with threshold nodes & SLA timers |
|                | Notifications          | `/admin/notification-policies`     | Event catalog routed to channels with digests |
| Master Data    | Vehicles               | `/admin/vehicles`                  | Vehicle master — registration, VIN, capacity, lifecycle |
|                | Drivers                | `/admin/drivers`                   | Driver master — licences, eligibility & documents |
|                | Routes                 | `/admin/routes`                    | Corridors, stops, distances & geofences |
|                | Fuel Stations          | `/admin/fuel-stations`             | Station master, tank inventory & pricing |
|                | Parts                  | `/admin/parts`                     | Parts catalogue with stock thresholds |
|                | Vendors                | `/admin/vendors`                   | Vendor profiles, KYC empanelment & user provisioning |
|                | Contracts              | `/admin/contracts`                 | Rate cards, escalation formulae & versioning |
| Integrations   | Connectors             | `/admin/integrations`              | Connector cards with health status |
|                | Webhooks               | `/admin/webhooks`                  | Outbound event delivery to external systems |
|                | API Keys               | `/admin/api-keys`                  | Scoped tokens for programmatic access |
|                | Sync Logs              | `/admin/sync-logs`                 | Per-connector sync outcomes |
| Operations     | Imports                | `/admin/imports`                   | Upload → map → validate → preview → commit wizard |
|                | Jobs                   | `/admin/jobs`                      | Business jobs: OCR, invoicing, fuel reconciliation |
|                | Background Tasks       | `/admin/background-tasks`          | Scheduled system tasks & cron management |
| Monitoring     | System Health          | `/admin/system-health`             | Live API service, process & memory health |
|                | Device Health          | `/admin/device-health`             | GPS device fleet status |
|                | Notification Health    | `/admin/notification-health`       | Delivery performance per channel |
| Audit          | Audit Events           | `/admin/audit`                     | Append-only, tamper-evident event timeline |
|                | Lineage Explorer       | `/admin/lineage`                   | Trace any record to its originating request |
|                | Override Register      | `/admin/override-register`         | Every rule bypass, who did it & who approved it |
| Settings       | Document Types         | `/admin/document-types`            | Insurance, fitness, permit, PUC & expiry rules |
|                | Localization           | `/admin/localization`              | Languages, translations & regional formats |
|                | Branding               | `/admin/branding`                  | Tenant look and feel — logo, theme, email |
|                | Tenant Settings        | `/admin/tenant-settings`           | Security, limits & feature toggles |

---

### Dispatcher Workspace (`/dispatcher/*`)

| Group      | Module               | Route                           | Description |
| ---------- | -------------------- | ------------------------------- | ----------- |
| Overview   | Dashboard            | `/dispatcher/dashboard`         | Live fleet map, trip queues & KPI tiles |
| Operations | Transport Requests   | `/dispatcher/transport-requests`| Incoming freight requests & indent allocation |
|            | Trip Management      | `/dispatcher/trips`             | Trip lifecycle management & status tracking |
|            | Vehicle Assignment   | `/dispatcher/vehicles`          | Compliance-checked vehicle allocation |
|            | Driver Assignment    | `/dispatcher/drivers`           | Resting duty timer (BR-DRV-05) & eligibility checks |
|            | Gate Queue           | `/dispatcher/anpr`              | ANPR gate queue & vendor indents |
|            | Exception Center     | `/dispatcher/exceptions`        | Real-time trip exception alerts & resolution |
|            | Reports              | `/dispatcher/reports`           | Dispatch analytics & KPI exports |

---

### Fleet Manager Portal (`/fleet/*`)

| Group   | Module        | Route                  | Description |
| ------- | ------------- | ---------------------- | ----------- |
| Overview | Dashboard    | `/fleet/dashboard`     | Fleet health overview & asset vitals |
| Assets  | Vehicles      | `/fleet/vehicles`      | Full vehicle spec, telematics counters & maintenance logs |
|         | Drivers       | `/fleet/drivers`       | Driver roster, licence status & trip history |
|         | Compliance    | `/fleet/compliance`    | Compliance status breakdown across fleet |
|         | Maintenance   | `/fleet/maintenance`   | Maintenance history & upcoming service schedule |
|         | Devices       | `/fleet/devices`       | GPS/telematics device registry & health |

---

### Compliance Manager Portal (`/compliance/*`)

| Group   | Module              | Route                          | Description |
| ------- | ------------------- | ------------------------------ | ----------- |
| Overview | Dashboard          | `/compliance/dashboard`        | Document heatmap (Fitness, Insurance, PUC, Permit, Tax), holds & overrides |
| Tasks   | Renewal Tasks       | `/compliance/renewals`         | Expiry checklists & statutory fee breakdown |
|         | OCR Verification    | `/compliance/ocr`              | Scanned document OCR parser comparison |
|         | Challan Dashboard   | `/compliance/challans`         | Violation analytics & traffic challan overview |
|         | Challan Workbench   | `/compliance/challans/workbench`| Tribunal dispute builder with GPS path logs |
|         | Insurance & Claims  | `/compliance/insurance`        | Active policies, endorsements & Claim 360 stepper |
|         | Incident 360        | `/compliance/incidents`        | Breakdown telemetry, severity counts & emergency dispatch |
|         | Reports             | `/compliance/reports`          | Statutory registers & audit ledger exports |

---

### Workshop Manager Portal (`/workshop/*`)

| Group     | Module           | Route                    | Description |
| --------- | ---------------- | ------------------------ | ----------- |
| Overview  | Dashboard        | `/workshop/dashboard`    | Workshop KPIs, bay utilisation & open job summary |
| Work      | Job Cards        | `/workshop/job-cards`    | Work order lifecycle, bay assignments & repair progress |
|           | Workshop Board   | `/workshop/board`        | Kanban-style visual board for job status |
|           | Estimates        | `/workshop/estimates`    | Repair cost estimates & approval |
| Planning  | PM Due List      | `/workshop/pm-due`       | Preventive maintenance calendar & scheduling |
|           | Parts Demand     | `/workshop/parts-demand` | Inventory demand from open job cards |
|           | Mechanic Roster  | `/workshop/mechanics`    | Mechanic availability & skill assignments |
|           | Reports          | `/workshop/reports`      | Workshop performance & cost reports |

---

### Finance Manager Portal (`/finance/*`)

| Group            | Module              | Route                        | Description |
| ---------------- | ------------------- | ---------------------------- | ----------- |
| Overview         | Dashboard           | `/finance/dashboard`         | KPI cards, Budget vs Actual, payment & approval queues |
| Budget & Spend   | Budget              | `/finance/budget`            | Budget monitoring, commitments & cost-center variance |
|                  | Vendor Bills        | `/finance/vendor-bills`      | 3-way match, rate escalation, detention & bill approval |
|                  | Customer Invoices   | `/finance/customer-invoices` | POD-triggered invoicing, GST fields & dispute lines |
| Disbursements    | Payments            | `/finance/payments`          | Payment runs, Maker-Checker release, UPI batch & FASTag ledger |
|                  | Driver Settlements  | `/finance/driver-settlements`| Trip settlements, advance, bhatta, recovery & payroll export |
|                  | Approvals           | `/finance/approvals`         | Financial approval queue for bills & budget exceptions |
| Reporting & Data | Reports             | `/finance/reports`           | Budget vs Actual, Cost/KM, Working Capital & Cost Traceability |
|                  | Exports             | `/finance/exports`           | SAP, Oracle, Tally, Excel, CSV & PDF exports with audit history |

---

### Vendor Portal (`/vendor/*`)

| Group                  | Module              | Route                          | Description |
| ---------------------- | ------------------- | ------------------------------ | ----------- |
| Overview               | Dashboard           | `/vendor/dashboard`            | Vendor command centre with operational vitals |
|                        | Vendor Scorecard    | `/vendor/scorecard`            | Performance metrics, SLA compliance & spot share trend |
| Operations & Dispatch  | Indent Inbox        | `/vendor/indents`              | Assigned freight indents awaiting vehicle assignment |
|                        | Placement Tracker   | `/vendor/placements`           | Indent compliance, reporting & gate entry status |
|                        | Trip Tracking       | `/vendor/trips`                | Real-time GPS movement, exception alerts & milestones |
| Fleet & HR             | My Fleet & Docs     | `/vendor/fleet`                | Fleet registry, document expiration & onboarding |
|                        | Drivers Roster      | `/vendor/drivers`              | Driver profiles, licensing & compliance state |
|                        | Driver Verification | `/vendor/drivers/verification` | Licence validation, background check & compliance |
|                        | Compliance Center   | `/vendor/compliance`           | Document expiry alerts, hold reasons & re-verification |
| Finance & Billing      | Bills Workbench     | `/vendor/bills`                | Freight bill submissions, verification & deduction details |
|                        | Submit New Bill     | `/vendor/bills/new`            | Create & submit freight bills with POD attachments |
|                        | Payment Tracking    | `/vendor/payments`             | Payment calendar, UTR receipts & settlement history |
| Account & System       | Profile & KYC 360° | `/vendor/profile`              | Vendor profile, bank account, GSTIN & KYC status |
|                        | Notifications Center| `/vendor/notifications`        | Operational alerts, document warnings & payment notifications |
|                        | Portal Settings     | `/vendor/settings`             | Preferences, webhook integrations & API key management |

---

### Driver Portal (`/driver/*`)

| Group               | Module            | Route                  | Description |
| ------------------- | ----------------- | ---------------------- | ----------- |
| Overview            | Dashboard         | `/driver/dashboard`    | Trip status, today's schedule & vitals |
|                     | Score & Earnings  | `/driver/score-earnings`| Performance score, earnings & incentive breakdown |
| Trips & Operations  | My Trips          | `/driver/trips`        | Active & historical trip log with route details |
|                     | Electronic POD    | `/driver/epod`         | Submit & view electronic proof of delivery |
|                     | Vehicle Inspection| `/driver/inspection`   | Pre-trip & post-trip vehicle inspection checklists |
| Finance             | Expense Claims    | `/driver/expenses`     | Submit & track fuel, toll & trip expenses |
|                     | Khata Management  | `/driver/khata`        | Driver ledger — advances, deductions & outstanding balance |
| Documents & Account | My Documents      | `/driver/documents`    | Licence, RC, permits & compliance documents |
|                     | My Profile        | `/driver/profile`      | Personal details, bank account & contact info |
|                     | Notifications     | `/driver/notifications`| Trip alerts, document expiry & system messages |
|                     | SOS & Emergency   | `/driver/sos`          | Emergency contacts, breakdown alerts & SOS trigger |

---

### Custom Role Dashboard (`/custom/*`)

Dynamically rendered for users with non-standard roles. Modules are **capability-filtered** at runtime — only the sections matching the user's assigned `capabilityKey` set are shown (e.g. `fleet.view`, `driver.manage`, `expense.approve`).

---

## Workspace Switcher

The left sidebar includes a **WORKSPACE** dropdown for `ADMIN` role users, enabling instant switching between all 8 portals without logging out:

```
Admin Suite  →  /admin/dashboard
Dispatcher Workspace  →  /dispatcher/dashboard
Fleet Manager Portal  →  /fleet/dashboard
Compliance Portal  →  /compliance/dashboard
Workshop Manager Portal  →  /workshop/dashboard
Finance Manager Portal  →  /finance/dashboard
Vendor Portal  →  /vendor/dashboard
Driver Portal  →  /driver/dashboard
```

The dropdown's selected value is automatically derived from the current route (`isDispatcher`, `isFleet`, `isDriver`, etc.), so it always reflects the active portal.

---

## Key Shared Components

| Component | Description |
| --------- | ----------- |
| [`AppSidebar.tsx`](frontend/src/components/AppSidebar.tsx) | Unified sidebar — resolves which portal nav to display based on route & role, persists collapsed group state to `localStorage` |
| [`CommandPalette.tsx`](frontend/src/components/CommandPalette.tsx) | Global ⌘K / Ctrl+K search over all modules |
| [`ProtectedRoute.tsx`](frontend/src/components/ProtectedRoute.tsx) | Role-guard wrapper used in the router |
| [`VelocityLogo.tsx`](frontend/src/components/VelocityLogo.tsx) | Responsive SVG logo component |
| [`LiveFleetMap.tsx`](frontend/src/components/admin/LiveFleetMap.tsx) | Leaflet-based real-time fleet map |
| [`admin/ui.tsx`](frontend/src/components/admin/ui.tsx) | Shared UI primitives (cards, badges, stat tiles) |

---

## Useful Commands

```bash
# Backend (from backend/)
npm run start:dev        # Watch mode API server
npm run build            # Production build → dist/
npm run lint             # ESLint check
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Push schema changes to PostgreSQL
npx prisma db seed       # Re-seed database

# Frontend (from frontend/)
npm run dev              # Vite dev server (HMR)
npm run build            # Production build (tsc + Vite)
npm run preview          # Serve the built production bundle
```

---

## Product Specification Docs

| File | Contents |
| ---- | -------- |
| `01-Phase1-Domain-Research-and-Industry-Analysis.md` | Industry analysis & domain research |
| `02-Phase2-Business-Requirements-Document.md` | Full BRD with stakeholder requirements |
| `03-Phase3-Product-Requirements-Document.md` | PRD with feature specs & service codes |
| `04-Phase4-System-Design-Document.md` | Architecture & system design |
| `05-Phase5-UIUX-Specification.md` | UI/UX design guidelines |
| `06-Phase6-Roadmap.md` | Phased delivery roadmap |
| `MANUAL_TESTING_WORKFLOW.md` | End-to-end manual testing procedures |
