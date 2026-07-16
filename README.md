# ArgoLogics FMS

A fleet management system: a NestJS + Prisma API, a React + Vite frontend, and Postgres.
The product specs live at the repo root as `01-Phase1…` through `05-Phase5…` — the
Phase 3 PRD defines the platform services, Phase 4 the APIs, and Phase 5 the screens and
information architecture. Code in this repo refers back to those documents by their IDs
(`P-01`, `S-35`, `BR-CMP-10`, and so on).

## Stack

| Layer    | Tech                                              | Port   |
| -------- | ------------------------------------------------- | ------ |
| Frontend | React 19, Vite, TypeScript, React Router, Axios    | `5173` |
| Backend  | NestJS 11, Prisma 7 (pg driver adapter), Passport JWT | `3000` |
| Database | Postgres 16 (Docker)                              | `5433` |

## Prerequisites

- **Node.js 22+** and npm 10+ (`node -v` — this project is developed on v22.13.1)
- **Docker Desktop**, for Postgres

## Setup

From a clone of the repo, run these in order.

### 1. Start Postgres

```bash
cd database
docker compose up -d
```

This runs Postgres 16 as the container `fms-postgres`, publishing **5433** on the host
(not the default 5432, so it won't clash with a local Postgres install). Data persists in
the `fms-db-data` volume.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

The defaults in `.env.example` already match the Docker Compose credentials, so this works
as-is for local development. `.env` is gitignored.

### 3. Install dependencies, migrate, and seed

```bash
cd backend
npm install
npx prisma migrate dev   # applies migrations and generates the Prisma client
npx prisma db seed       # roles, admin user, org tree, rule packs, connectors, …
```

### 4. Install the frontend

```bash
cd frontend
npm install
```

## Running

Two terminals:

```bash
# Terminal 1 — API on http://localhost:3000
cd backend && npm run start:dev

# Terminal 2 — app on http://localhost:5173
cd frontend && npm run dev
```

Open <http://localhost:5173> and sign in with the seeded administrator:

| Email               | Password      |
| ------------------- | ------------- |
| `admin@fleetos.com` | `password123` |

The API base URL is currently hardcoded in `frontend/src/services/api.ts`. If you change
the backend port, change it there too.

## Project layout

```
FMS/
├── 01-…05-Phase*.md      Product specs (research → BRD → PRD → system design → UI/UX)
├── database/             docker-compose.yml for Postgres
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma Data model
│   │   ├── migrations/   Version-controlled SQL
│   │   └── seed.ts       Seed data (idempotent — safe to re-run)
│   └── src/
│       ├── auth/         Login, JWT strategy, JwtAuthGuard, RolesGuard
│       ├── user/         User lookup and profile
│       ├── prisma/       PrismaService (pg driver adapter)
│       └── admin/        Admin suite services + controller (see below)
└── frontend/src/
    ├── context/          AuthContext (session, login/logout)
    ├── services/         api.ts (axios + JWT interceptor), adminApi.ts (typed admin client)
    ├── components/admin/ Shared admin UI kit (Panel, Modal, Toast, Badge, …)
    ├── styles/admin.css  Admin styling, built on the tokens in index.css
    └── pages/
        ├── Dashboard.tsx Operations console
        └── admin/        The seven admin modules
```

## The Admin suite (S-35)

`/admin` implements the seven modules from the Phase 5 IA, each backed by real APIs under
`/admin/*` and guarded by `JwtAuthGuard` + `Roles('ADMIN')`:

| Route                          | Module                | Backing service     |
| ------------------------------ | --------------------- | ------------------- |
| `/admin/org`                   | Org tree, role builder, users | P-01 Identity, RBAC & Org |
| `/admin/rule-packs`            | Rule-pack editor      | M-21 Compliance Suite |
| `/admin/approval-flows`        | Approval-flow designer | P-02 Approvals Engine |
| `/admin/notification-policies` | Notification matrix   | P-03 Notifications  |
| `/admin/integrations`          | Connector hub         | P-06 Integration    |
| `/admin/imports`               | Import wizard         | P-06 Import         |
| `/admin/audit`                 | Audit explorer        | P-05 Audit          |

Two behaviours are worth knowing before you change this code:

- **Every admin mutation writes an audit event.** `AuditService.record` hashes each event
  together with the previous event's hash, so editing history retroactively breaks the
  chain — which `GET /admin/audit-events/verify` detects and the UI surfaces. Events also
  carry a `parentId`, which is what the lineage viewer walks backwards.
- **Segregation of duties is enforced server-side.** A role (or a user's stacked roles)
  cannot hold a conflicting capability pair; the API rejects the save with a 400 whose body
  lists the conflicts. The role builder calls the same validator live as you edit.

## Common tasks

```bash
# Backend
npm run start:dev        # watch mode
npm run build            # compile to dist/
npm run start:prod       # run the compiled build
npm run lint             # eslint --fix
npm test                 # jest

# Prisma (from backend/)
npx prisma migrate dev --name <name>   # create + apply a migration after editing schema.prisma
npx prisma generate                    # regenerate the client (needed after schema changes)
npx prisma studio                      # browse the database
npx prisma migrate reset               # drop, re-migrate, re-seed

# Frontend
npm run dev              # dev server
npm run build            # typecheck + production build
npm run preview          # serve the production build
npm run lint             # oxlint
```

Prisma 7 reads the datasource URL from `prisma.config.ts` (which loads `.env`), not from
`schema.prisma` — so CLI commands need `backend/.env` to exist.

## Troubleshooting

**`Property 'X' does not exist on type 'PrismaService'`** — the generated client is stale
after a schema edit. Run `npx prisma generate`.

**`DATABASE_URL environment variable is not defined`** — you're missing `backend/.env`, or
you're running the command from the wrong directory. Prisma and Nest both load it relative
to `backend/`.

**`Can't reach database server at 127.0.0.1:5433`** — Postgres isn't up. Check with
`docker ps` for `fms-postgres`, then `cd database && docker compose up -d`.

**Login returns 401 with the seeded credentials** — the seed may not have run. Re-run
`npx prisma db seed`; it upserts, so it's safe to run repeatedly.

**Admin pages return 403** — the signed-in user lacks the `ADMIN` role. Every `/admin/*`
route requires it. Assign roles at `/admin/org` → Users, or sign in as the seeded admin.
