# ArgoLogics FMS

A comprehensive Fleet Management System: a NestJS 11 + Prisma 7 API, a React 19 + Vite frontend, and Postgres 16.

---

## Tech Stack

| Layer    | Tech                                                      | Port   |
| -------- | --------------------------------------------------------- | ------ |
| Frontend | React 19, Vite, TypeScript, React Router 7, Axios          | `5173` |
| Backend  | NestJS 11, Prisma 7 (pg driver adapter), Passport JWT, bcrypt | `3000` |
| Database | Postgres 16 (Docker)                                      | `5433` |

---

## Prerequisites

- **Node.js 22+** and npm 10+ (`node -v`)
- **Docker Desktop**, for Postgres

---

## Setup & Quickstart

From a clone of the repo, run these steps in order:

### 1. Start Postgres Container

```bash
cd database
docker compose up -d
```
This starts Postgres 16 on host port **5433** (container `fms-postgres`), saving data to the `fms-db-data` volume.

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

### 3. Database Migration & Seeding

```bash
cd backend
npm install
npx prisma db push      # syncs schema to Postgres
npx prisma db seed      # seeds roles, admin, dispatcher, fleet, compliance & workshop users
```

### 4. Install & Run Frontend

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

## Seeded Accounts & Fast Access Demo Sign-In

The login page (`SignInPage.tsx`) includes **⚡ Fast Access Auto-Fill** buttons for 1-click credential filling:

| Workspace / Portal         | Email                     | Password      | Role                 |
| -------------------------- | ------------------------- | ------------- | -------------------- |
| ⚖️ Compliance Manager      | `compliance@fleetos.com`  | `password123` | `COMPLIANCE_MANAGER` |
| 🔧 Administrator           | `admin@fleetos.com`       | `password123` | `ADMIN`              |
| ⚡ Dispatcher               | `dispatcher@fleetos.com`  | `password123` | `DISPATCHER`         |
| 🚚 Fleet Manager           | `manager@fleetos.com`     | `password123` | `FLEET_MANAGER`      |
| 🛠️ Workshop Manager        | `workshop@fleetos.com`    | `password123` | `WORKSHOP_MANAGER`   |

---

## System Architecture & Portal Overview

ArgoLogics FMS is architected around 5 core operational suites:

```
FMS/
├── 01-…05-Phase*.md      Product specs (Research → BRD → PRD → Architecture → UI/UX)
├── database/             docker-compose.yml for Postgres 16
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma Data model & relations
│   │   ├── seed.ts       Main idempotent seed (roles, users, org, rules, dispatch, workshop)
│   │   └── seed-compliance.ts Compliance role & user seed
│   └── src/
│       ├── auth/         JWT authentication, login, Guards (JwtAuthGuard, RolesGuard)
│       ├── user/         User profile & identity lookup
│       ├── dispatcher/   Trip assignment, vehicle-driver match & ANPR queues
│       ├── workshop/     Job cards, PM schedules & parts demand services
│       └── admin/        Admin suite services (RBAC, Audit, Integrations, Rules)
└── frontend/src/
    ├── context/          AuthContext (session, active roles, JWT handling)
    ├── services/         api.ts, adminApi.ts, dispatcherApi.ts
    ├── components/       AppSidebar (workspace switcher), ProtectedRoute UI kit
    ├── styles/admin.css  Design system tokens & custom layouts
    └── pages/
        ├── SignInPage.tsx Fast login access with 1-click demo buttons
        ├── admin/        🔧 Admin Suite (S-35) & Admin Direct Switch Portal
        ├── dispatcher/   ⚡ Dispatcher Workspace (P-11)
        ├── fleet/        🚚 Fleet Manager Portal (S-01)
        ├── compliance/   ⚖️ Compliance Manager Portal (S-22 to S-26, S-34)
        └── workshop/     🛠️ Workshop Manager Portal (R-06)
```

---

## Portal Suites & Functionality

### 1. ⚖️ Compliance Manager Portal (`/compliance/*`) — Services S-22 to S-26, S-34
- **Compliance Dashboard (`/compliance/dashboard`)**: Vehicle document heatmap (Fitness, Insurance, PUC, Permit, Tax), active compliance holds & override authorization.
- **Renewal Tasks & OCR (`/compliance/renewals/*`)**: Expiry checklists, fee breakdown, statutory scan OCR parser comparison.
- **Traffic Challan Workbench (`/compliance/challans/*`)**: Violation analytics, tribunal dispute builder with GPS path logs, responsibility allocation & payment gateway.
- **Insurance Policies & Claims (`/compliance/insurance/*`)**: Active policy register, endorsement tracking, Claim 360 SLA milestone stepper & surveyor logs.
- **Incident Monitoring & 360 (`/compliance/incidents/*`)**: Breakdown severity counts, real-time telemetry clip timeline & emergency dispatch.
- **Statutory Reports (`/compliance/reports`)**: Export statutory registers and audit ledgers.

### 2. 🔧 Admin Suite (`/admin/*`) — Service S-35
- **Admin Direct Switch Portal**: Direct quick-launch cards to instantly access any operational suite.
- **Org Tree & RBAC (`/admin/org`, `/admin/roles`, `/admin/users`)**: Visual org hierarchy, capability editor, and server-side Segregation of Duties (SoD) validator.
- **Rule Packs & Approvals (`/admin/rule-packs`, `/admin/approval-flows`)**: Business logic engine & multi-step approval workflows.
- **Integrations & Audit (`/admin/integrations`, `/admin/audit`)**: Telematics connectors & tamper-evident hash-chained audit log explorer.

### 3. ⚡ Dispatcher Workspace (`/dispatcher/*`) — Service P-11
- **Vehicle & Driver Assignment (`/dispatcher/vehicles`, `/dispatcher/drivers`)**: Compliance checklist blocks, resting duty timers (BR-DRV-05) & trip dispatch.
- **Live Fleet Tracking & ANPR Queue (`/dispatcher/runs`, `/dispatcher/anpr`)**: Real-time vehicle telematics, gate queue & vendor indents.

### 4. 🚚 Fleet Manager Portal (`/fleet/*`) — Service S-01
- **Asset Master (`/fleet/vehicles`, `/fleet/drivers`)**: Complete vehicle specifications, telematics counters & maintenance logs.
- **Fleet Compliance (`/fleet/compliance`)**: Compliance status breakdown across active fleet assets.

### 5. 🛠️ Workshop Manager Portal (`/workshop/*`) — Service R-06
- **Job Cards & Maintenance Board (`/workshop/job-cards`, `/workshop/board`)**: Work order lifecycle, bay assignments & repair progress tracking.
- **PM Due Schedules & Parts Demand (`/workshop/pm-due`, `/workshop/parts-demand`)**: Preventive maintenance calendar, mechanic rosters & inventory demand.

---

## Admin Direct Switch Portal

For users with the `ADMIN` role, ArgoLogics FMS provides direct workspace switching via:
1. **Admin Direct Switch Portal Panel** on the main Admin Dashboard (`/admin/dashboard`).
2. **Workspace Switcher Dropdown** in the left sidebar navigation rail ([AppSidebar.tsx](file:///d:/FMS/frontend/src/components/AppSidebar.tsx)).

---

## Useful Commands

```bash
# Backend CLI commands (from backend/)
npm run start:dev        # Watch mode API
npm run build            # Production build to dist/
npm run lint             # ESLint check
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Push schema changes to Postgres
npx prisma db seed       # Re-seed database

# Frontend CLI commands (from frontend/)
npm run dev              # Vite dev server
npm run build            # Production build (tsc + Vite)
npm run preview          # Serve built production bundle
```
