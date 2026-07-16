# Enterprise Fleet Management System (FMS)
## Phase 2 — Business Requirements Document (BRD)

| Document Control | |
|---|---|
| Document | Phase 2 of 6 — Business Requirements Document |
| Product | Enterprise Fleet Management System (working name: **FleetOS**) |
| Version | 1.0 |
| Date | 13 July 2026 |
| Status | For review |
| Upstream | Phase 1 — Domain Research & Industry Analysis v1.0 (all references "P1 §x" point there) |
| Downstream | Phase 3 PRD (module specs), Phase 4 System Design (RBAC enforcement, schema), Phase 6 Roadmap (prioritization) |
| Conventions | Roles **R-xx** · Processes **BP-xx** · Approval flows **AF-xx** · Business rules **BR-XXX-nn** · KPIs **KPI-xx** · Pain points **PP-xx** · Requirements **REQ-xx** |

---

## 1. Purpose & Scope

**1.1 Purpose.** This BRD translates Phase 1's domain research into the business layer of the product: who the stakeholders and users are, what they do daily, what they may and may not do in the system, the business processes the product must execute, the approval flows that govern them, the rules that constrain them, the KPIs that measure them, and the traceable link from documented pain to committed requirement. Phase 3 (PRD) will consume every artifact here: each role becomes personas + permission sets; each process becomes module user-flows; each rule becomes validation/automation logic; each KPI becomes a report or dashboard widget.

**1.2 In scope (business capabilities).** Fleet asset management (owned + leased + hired); driver workforce management incl. khata settlement; goods trip lifecycle (request → dispatch → ePOD → costing → billing); passenger operations (pool cars, cab booking, employee transportation, institutional routes); vendor fleet management (empanelment → indent → placement → scorecard → settlement); fuel (cards, stations, bowsers, sensors); maintenance & workshop with parts inventory; tyre & battery lifecycles; compliance engine (India pack v1: RC, insurance, fitness, permit, PUC, tax, AIS-140, e-way bill, FASTag; US/EU packs later); toll/FASTag reconciliation; gate & weighbridge (vertical pack); approvals engine; costing & budgets; reports/analytics/AI layer; notifications; audit.

**1.3 Out of scope (v1).** Full WMS, full TMS network optimization (SAP/OTM territory — P1 §G.2.11–12), freight forwarding/multimodal, in-house payroll processing (we compute components, HRMS/payroll executes), insurance underwriting, fuel retailing, hardware manufacturing (partner model per P1 P5), consumer ride-hailing.

**1.4 Target customer segments (priority order for v1).** (1) Transport contractors / fleet owners 25–500 vehicles (fastest sales cycle, full-stack usage, reference engine for enterprise deals); (2) Manufacturing plants & FMCG logistics (vendor-heavy, highest-value white space #1–2 per P1 §H); (3) Corporate ETS operators & facilities teams; (4) Construction & mining (vertical packs); (5) Government/PSU & institutions (longest cycle, entered via tenders once audit/security certifications exist — Phase 6 sequences this).

---

## 2. Business Context & Goals

**2.1 Context (from P1).** Enterprise transport departments run four families of tooling that don't talk to each other (telematics, maintenance, TMS, compliance) glued by Excel/WhatsApp; 30–70% of movements are vendor-supplied and essentially untracked in software; compliance enforcement has gone digital and automatic while fleet records haven't; the cost base (fuel 30–45%, tyres #2–3 in heavy verticals) leaks at every unreconciled interface. Incumbent resentment is concentrated on contracts, false alerts, support decay, and hardware lock-in (P1 §G.5).

**2.2 Customer business goals the product must deliver.** These are the outcomes we will contract against in enterprise deals and design KPIs around (§8). Ranges are conservative composites of the improvement claims validated in P1 research and standard industry results; Phase 6 turns them into ROI-calculator defaults.

| Goal | Statement | Measure (customer-side) | Target (12 months post-adoption) |
|---|---|---|---|
| G1 | Cut total fleet operating cost | Cost/km (or /tonne-km, /employee-trip) vs baseline | −8–15% |
| G1a | — fuel leakage eliminated | Fuel exceptions detected & recovered; norm adherence | Leakage −3–6% of fuel spend |
| G1b | — freight/vendor bill leakage eliminated | Auto-verification deviations caught | −2–4% of freight spend |
| G1c | — maintenance cost optimized | Maintenance ₹/km; PM:breakdown ratio | −5–10%; PM-dominant workload |
| G2 | Zero compliance-expiry operating days | Vehicle-days operated with any blocking document expired | 0 (from typical 2–5%) |
| G3 | Full money-event traceability | % cost events linked request→trip→ledger | ≥98% |
| G4 | Raise asset productivity | Deployment %, loaded-km ratio, utilization spread across sites | +10–20% deployment; deadhead −5–10 pts |
| G5 | Improve service levels | Placement compliance, on-time dispatch/pickup, OTIF | +10–15 pts on baseline |
| G6 | Improve safety & duty-of-care | Accidents/million km; 100% verified safe-drop (ETS); duty-hour violations | −20–40%; 100%; →0 |
| G7 | Compress working capital | POD-to-invoice days; vendor settlement cycle | −30–50% |
| G8 | Make the fleet auditable | Audit findings on transport; challan aging; log completeness | Zero repeat findings |
| G9 | Digitize the department | % transactions born-digital in FMS; Excel-register retirement | ≥80% in 6 months |

**2.3 Product-side (vendor) goals shaping the BRD.** V1 must be **modularly licensable** (per-vehicle per-module pricing; ETS priced per-employee-trip option), **monthly-terminable** (P1 P9 — contract terms are a feature), **hardware-agnostic** (certified-device partner list, BYO device), **multi-tenant SaaS first** with single-tenant/on-prem variant reserved for government tier (P1 D.10), and **implementation-light** (guided migration, go-live ≤ 4 weeks for ≤200 vehicles — countering P1 §G.5's implementation-burden complaint).

**2.4 Non-goals.** We do not chase owner-operators (1–5 trucks) with a free app in v1 (unit economics of support; revisit in Phase 6 as vendor-side seeding via the vendor portal). We do not build cameras or devices. We do not attempt US ELD certification in v1 (regulatory pack sequencing, Phase 6).

---

## 3. Stakeholder Analysis

### 3.1 Stakeholder classes (cross-vertical)

| Class | Who | Stake | Attitude risk | Engagement strategy the product must support |
|---|---|---|---|---|
| Economic buyer | CFO / Plant Head / Owner / Registrar / City Admin Head | Cost reduction, risk elimination, audit safety | Skeptical of "another IT project" | ROI dashboard vs baseline (G1–G9); monthly value report auto-emailed |
| Executive sponsor | Transport Head / Logistics Head / P&M Head | Departmental control, service credibility | Champion if empowered — the product's #1 ally | Command dashboards, exception-first design, board-ready reports |
| Administrators | IT / CISO | Security, integrations, maintainability | Gatekeeper; can veto | SSO, RBAC, audit logs, API docs, DPDP/SOC2 posture (Phase 4) |
| Daily operators | Dispatchers, coordinators, workshop, fuel, gate staff | Workload, blame protection | Passive resistance if the tool adds work | Fewer clicks than the register; evidence trails that protect them |
| Field workforce | Drivers, mechanics, attendants | Income transparency, surveillance fear | Highest resistance risk (P1 D.9) | Driver-as-user design: khata visibility, vernacular, privacy modes |
| External parties | Transport vendors, garages, fuel pumps, brokers | Business share, payment speed | Will game weak systems | Vendor portal with faster verified payments as the carrot |
| Control functions | Finance, HR, Internal Audit, Safety/EHS | Ledger accuracy, statutory compliance, duty-of-care | Demand evidence, not screens | Exportable, immutable, reconciled records |
| Beneficiaries | Employees (ETS), parents (education), departments (requesters) | Service quality, safety | Adoption multiplier via apps | Booking/tracking apps with SLAs visible |
| External authorities | RTO/State transport, GST officers, DGMS, CAG/auditors, insurers, MACT courts | Statutory compliance, evidence | Not users; consumers of outputs | Statutory registers, evidence packs, as-on-date snapshots |
| Unions / driver bodies | Driver unions (state transport, plants, mines) | Working conditions, monitoring consent | Can block camera/tracking rollouts | Transparent policy config: off-duty masking, data-use notices |

### 3.2 Buying-center map by vertical (who signs, who champions, who resists)

| Vertical | Economic buyer | Champion | Key influencers | Likely resister | Trigger event that opens the deal |
|---|---|---|---|---|---|
| Manufacturing | Plant Head / CFO | Plant logistics/admin head | SCM, security head, SAP/IT team | Incumbent freight clerks; transporters fearing bill scrutiny | Freight-cost audit finding; detention dispute blowup; e-way bill penalty |
| Construction | Director / CFO | P&M head | Project managers, plant accountants | Site supervisors (fuel/hour data exposure) | Diesel theft discovery; idle-asset writeoff; hire-bill dispute |
| Mining | Mine owner / MDO CEO | Mine ops head | DGMS compliance officer, contractor cell | Contractors (output billing transparency) | DGMS audit; tyre-cost spike; production-reconciliation dispute |
| FMCG | Supply chain VP | Regional logistics manager | C&FA operators, sales (OTIF pressure), finance | Transporters; C&FA staff | OTIF miss on a key account; freight-bill fraud case |
| Logistics/3PL | Owner / COO | Operations head | Key account managers, accounts team | Old-school branch managers | Working-capital crunch; customer demanding track-&-trace + ePOD |
| Warehouse | DC head / 3PL contract owner | Shift operations manager | WMS team, safety officer | Yard contractors | Detention penalties; forklift accident |
| Government | Dept. Secretary / HoD | Transport officer / motor section OIC | Finance officer, NIC/IT cell, AG audit | Drivers (log-book exposure), garage vendors | CAG paragraph on vehicle misuse; condemnation backlog |
| University | Registrar / Trustee board | Transport officer | Parents' committee, safety committee, bursar | Contracted operators | Bus incident; parent escalation; fee-cost review |
| Corporate ETS | CHRO / Admin head / CFO | Transport/facilities manager | HR (shift rosters), women-safety committee, procurement | Cab vendors (km billing exposure) | Safety incident/near-miss; vendor billing audit; POSH/duty-of-care review |
| Contractor | Owner (proprietor) | Owner's son/daughter (usually the digitizer) | Accountant (munshi), major client's logistics team | Senior drivers; munshi fearing role loss | Client mandates tracking/ePOD; EMI stress forces cost hunt |

**Design consequence:** every "resister" row is a user whose workflow must get *easier*, not just more visible — Phase 3 UX briefs carry a "resister win" note per module (e.g., freight clerk: auto-prepared bill annexures replace their worst chore; munshi: settlement math automated but munshi remains the approver).

### 3.3 Stakeholder concerns → BRD artifacts

| Concern (recurring in P1) | Raised by | Answered in |
|---|---|---|
| "Will drivers accept tracking?" | Unions, HR, owners | R-10 driver design; BR-SEC rules (privacy); §10 assumptions |
| "Our vendors won't use software" | Vendor managers | R-11 vendor portal role; BP-18/19; PP-05 |
| "Who approved this trip/expense?" | Finance, audit | AF catalog §6; BR-FIN rules; audit KPIs |
| "Can we run it during audits/tenders?" | Govt, PSU | R-24 auditor role; BP-27 outputs; G8 |
| "What if the internet/device fails?" | Ops, IT | §10 constraints (offline-first, degradation ladder P1 D.4) |
| "We already have SAP/HRMS/weighbridge" | IT | Integration touchpoints flagged per BP; Phase 4 scope |

---
## 4. User Roles

Twenty core roles (R-01…R-20, from the brief) plus four extended roles (R-21…R-24) observed in Phase 1 research. Format per role: **Profile** (who, device, digital literacy) · **Responsibilities** · **Daily tasks** (typical timeline) · **Permissions** (business-level; the machine-readable matrix is §5) · **Screens** (primary workspaces, feeding Phase 5) · **KPIs** (they are measured by — full formulas §8) · **Pain today** · **Reports needed**. Roles are *hats*, not headcount: in a 30-vehicle contractor, one person wears five hats; the RBAC model must allow role-stacking without permission conflicts (§5.4).

### R-01 Super Admin
**Profile:** customer's IT administrator or our implementation engineer; desktop; expert user. **Responsibilities:** tenant setup, org hierarchy (group→entity→region→site→cost center), user provisioning & role binding, SSO/SCIM config, module activation per site, master-data governance (vehicle classes, document types, rule-pack parameters, notification policies), integration credentials, data import/export, environment health. **Daily tasks:** user requests (join/leave/transfer), permission changes with approval trail, master updates, monitoring import jobs and integration errors. **Permissions:** full configuration scope; **no blanket access to operational financial data by default** (segregation — configurable), cannot delete audit logs (nobody can). **Screens:** Admin console (org, users, roles, modules), settings/config studio, integration hub, import/migration wizard, audit log viewer, usage/adoption dashboard. **KPIs:** provisioning TAT, integration uptime, master-data quality score, adoption % per module (G9). **Pain today:** shadow spreadsheets everywhere, no single user directory, vendor tools with per-seat pricing forcing account sharing (P1 §G.2.9's unlimited-user lesson). **Reports:** user-access review (quarterly, for audit), permission-change log, module usage, data-quality exceptions.

### R-02 Transport Head
**Profile:** department owner (AGM/DGM Transport, P&M Head, Transport Officer); desktop + mobile; moderate digital literacy; meeting-heavy day. **Responsibilities:** policy (allocation priorities, fuel norms, duty rules, penalty policies), budgets and variance, vendor contracts and rate approvals, escalated approvals (AF thresholds), fleet size/mix decisions, compliance accountability (their signature is on statutory documents), management reporting. **Daily tasks:** 08:30 command dashboard review (yesterday's exceptions, today's readiness — P1 F.7's ritual); approval queue (10–40 items: high-value trips, estimates, bills, overrides); one escalation call (breakdown, accident, vendor failure); weekly: scorecards, PM compliance, budget burn; monthly: cost/km league, right-sizing, board pack. **Permissions:** approve at top thresholds; policy/rule-parameter changes (with dual control); all-site visibility; override compliance blocks (logged, notified to management — P1 F.4); cannot edit transactional records directly (view + send-back only). **Screens:** executive command dashboard, approval inbox, budget vs actuals, vendor scorecards, compliance heatmap, cost analytics, override console. **KPIs:** G1–G9 rollups — cost/km vs budget, fleet availability, zero-expiry days, placement compliance, accident rate, audit findings. **Pain today:** discovers problems at month-end; approvals chase him on WhatsApp; no defensible data for fleet-size decisions; audit anxiety. **Reports:** daily exception digest (auto-email 07:00), weekly ops pack, monthly cost & compliance pack, annual right-sizing pack (P1 F.13).

### R-03 Fleet Manager
**Profile:** owns asset health & documents for a site/region (100–300 vehicles); desktop + field mobile; good digital literacy. **Responsibilities:** vehicle master integrity, compliance calendar execution (T−30 discipline, P1 F.10), PM program adherence, insurance/claims coordination, tyre/battery programs, disposal pipeline, driver-vehicle pairing policy, telematics device health. **Daily tasks:** 09:00 compliance board (reds/ambers → renewal actions); PM due-list vs dispatch negotiation (BP-12); device-health console sweep (silent trackers = blind vehicles); claims follow-ups; vehicle inspections (2–3/day, mobile checklist); afternoon: renewal vendor coordination, document uploads/verification. **Permissions:** vehicle CRUD, document CRUD + verification, PM schedule config, job-card approval to mid threshold, initiate disposal (not approve), tyre/battery events, device assignments. **Screens:** fleet board (vehicles×status), vehicle 360° (the single most-used detail screen: identity, documents, counters, history, costs), compliance calendar, PM planner, claims tracker, device health, tyre/battery registers. **KPIs:** fleet availability %, compliance coverage (zero expiry days), PM compliance ≥95%, claim cycle days, device ping-health %, tyre cost/km. **Pain today:** renewal surprises, document photocopies in cupboards, PM postponed forever by dispatch pressure with no arbitration record, insurer disputes for want of history. **Reports:** expiry forecast 30/60/90, PM compliance by site, vehicle history dossier (per vehicle, one click — insurer/RTO/buyer-ready), claims register, downtime Pareto.

### R-04 Dispatcher
**Profile:** the highest-frequency power user (P1 B.26); control-room desktop (often dual-screen) + phone glued to ear; 50–200 movements/day; moderate literacy, extreme domain fluency. **Responsibilities:** convert approved demand into today's executable plan; allocate vehicles/drivers/vendors; sequence loading; publish; re-plan all day; keep the live board honest; first responder to en-route exceptions. **Daily tasks:** 06:00 readiness check (who/what actually turned up) → gap-fill (substitutions, vendor spot calls) → dispatch wave with gate pre-authorization → live monitoring (geofence milestones, delay alerts) → 11:00 second wave / urgent insertions → afternoon: tomorrow's draft plan from approved requests → 18:00 closure sweep (undelivered trips, night-halt confirmations). **Permissions:** create/assign/re-plan/dispatch trips; issue vendor indents against contracts; request (not grant) compliance overrides; log exceptions; cannot alter rates, approve bills, or edit closed trips. **Screens:** **dispatch board** (demand lane / capacity lane / assignment canvas — the product's flagship screen, P1 §G.4 SAP-Cockpit pattern), live map, exception queue, vendor indent tracker, driver duty roster (read), gate queue. **KPIs:** dispatch on-time %, plan stability %, allocation lead time, owned-fleet first-fill %, exception closure time, loading TAT. **Pain today:** the whole plan lives in his head + WhatsApp; every re-plan re-typed thrice (register, Excel, message); blamed for double-allocations the tools couldn't prevent (BR-TRP-03/04/05 exist because of him). **Reports:** daily dispatch summary, unfilled-demand carryover, vendor placement failures, exception log.

### R-05 Transport Coordinator
**Profile:** site/depot-level doer (often one per plant/campus/depot); desktop + mobile; junior; executes what the dispatcher/head decides. **Responsibilities:** request intake & data completion (the human API between requesters and the system), duty-slip issuance & closure, driver attendance marking, document collection (PODs, bills, gate slips), first-line requester support, data entry for offline events. **Daily tasks:** process request queue (validate, complete, route to approval); print/issue duty slips; morning driver attendance; noon: chase PODs & close yesterday's duties (km in/out, passenger signatures); log fuel/cash bills; answer "where is my vehicle" calls (which the employee app should absorb — PP-14). **Permissions:** request CRUD (pre-approval), duty-slip issue/close, attendance, document upload; no rate/vendor/approval powers. **Screens:** request queue, duty-slip console, attendance board, POD inbox, my-site trip list. **KPIs:** request processing TAT, duty-slip closure same-day %, POD collection lag, data completeness score. **Pain today:** triple entry (paper slip → register → Excel), month-end reconstruction of missing slips, being shouted at from both sides. **Reports:** open duties aging, pending PODs, request TAT by department.

### R-06 Workshop Manager
**Profile:** garage in-charge (5–25 mechanics, 2–10 bays); desktop in a dusty cabin + mobile on the floor; strong mechanical, moderate digital skills. **Responsibilities:** job-card pipeline (BP-13/22, P1 C.4), bay & mechanic scheduling, estimates & approvals, parts demand to stores, outside-work vendoring, quality (first-time-fix), downtime minimization, warranty capture. **Daily tasks:** 08:00 floor walk → job-card status sweep (WaitingParts vs InWork honesty); prioritize by vehicle-down cost vs dispatch pressure; raise/chase estimates; assign tasks per skill; inspect completed work + road tests; evening: tomorrow's bay plan against PM due-list. **Permissions:** job-card lifecycle CRUD, estimate creation (approval per AF-05 thresholds), parts requisition, outside-work PO request, mechanic task assignment; cannot approve own estimates above threshold (P1 F.11 segregation). **Screens:** workshop board (bays × jobs, kanban by job-card state), job-card detail, estimate builder, parts availability, mechanic roster & productivity, PM due-list. **KPIs:** vehicle-down hours/job, first-time-fix ≥85%, repeat-repair ≤5%, estimate accuracy ±10%, PM:breakdown ratio, mechanic utilization. **Pain today:** job cards on carbon paper; "waiting parts" invisible so the workshop eats blame for stores' delays; no downtime costing to defend prioritization. **Reports:** downtime by vehicle/system, job cost vs estimate, waiting-parts aging, warranty recovered.

### R-07 Maintenance Engineer
**Profile:** technical planner above the workshop (enterprise fleets; often one per region); desktop-first; engineering literacy. **Responsibilities:** PM schedule design per model (intervals, task lists, parts kits — P1 B.9), failure analysis (breakdown root causes → schedule updates), DTC/telematics triage (which fault codes open job cards), warranty strategy, technical standards (oils, parts brands, retread policies), workshop-vs-outside policy, technical audits. **Daily tasks:** review overnight DTC feed and breakdown tickets → classify root causes; tune PM tasks (e.g., add coolant-hose check after third failure); review estimate-vs-actual variances for padding; approve technical deviations (non-OEM part substitutions). **Permissions:** PM schedule CRUD, DTC rule config, parts-catalog technical fields, root-cause taxonomy, technical approval on estimates (parallel to financial approval). **Screens:** PM schedule studio, failure/root-cause analytics, DTC triage queue, warranty tracker, technical-standards library. **KPIs:** breakdowns per lakh km (target −40–60% per P1 F.2), MTBF by system, PM effectiveness (breakdowns within N days of PM = red flag), warranty recovery ₹. **Pain today:** no failure data to engineer against; schedules copied from OEM manuals regardless of duty cycle; warranty claims lapse silently. **Reports:** reliability (MTBF/MTTR by model/system), PM effectiveness, top-10 failure modes, oil-analysis trends (roadmap).

### R-08 Mechanic
**Profile:** floor technician; shared tablet/kiosk or personal Android; low digital literacy, vernacular; gloves/grease reality (P1 D.2). **Responsibilities:** execute assigned job-card tasks, record actuals honestly (time, parts fitted with serials where tracked, old-part returns), report additional defects found mid-job, safety compliance. **Daily tasks:** clock onto tasks from the board; pick parts (against job card only — BR-MNT-06); fit, note serials (tyres/batteries); flag extra defects with photo (converts to estimate revision); clock off; road-test assist. **Permissions:** task status update, parts consumption confirm, defect-found reporting, photo upload; **nothing else** — no costs, no approvals, no other vehicles' data. **Screens:** my-tasks (big-button, icon-first, vernacular), task detail with checklist + photo capture, defect-found quick form. **KPIs:** tasks/day vs standard time, rework rate, defect-found contribution (positive metric — reward finding problems early). **Pain today:** verbal instructions, blamed for delays caused elsewhere, no record of extra work done. **Reports:** none consumed; his output feeds R-06/R-07 reports. *(Design note: if the mechanic interface takes >30 seconds per interaction, it will be abandoned and the workshop module dies — this is a Phase 5 hard constraint.)*

### R-09 Fuel Manager
**Profile:** fuel clerk/officer at depot or site fuel station; desktop + station tablet; numeric-fluent. **Responsibilities:** run the reconciliation square (P1 B.8): card program admin (limits, blocks — BP-11), own-station stock (purchases, decantation, dips, issues), bowser logs, sensor-alert triage, norm exception queue, OMC statement reconciliation, rebate tracking. **Daily tasks:** morning dip-stick entry vs book stock; review overnight exceptions (odd-hour fills, volume>tank, off-route stations, sensor drops); process fuel indents for today's long trips; weekly: OMC statement import & match; monthly: norm review pack with driver-wise km/l. **Permissions:** fuel transaction CRUD (station/bowser), card limit changes ≤ threshold (above → AF-04), exception disposition (clear/escalate), norm proposals (approval by R-02). **Screens:** fuel control tower (stock, issues, exceptions), station/bowser ledger, card console, reconciliation workbench, norm manager. **KPIs:** stock variance ≤0.5%, exceptions cleared ≤48h, % spend on-card, recovery ₹ from catches, rebate capture. **Pain today:** four unreconciled sources (P1 B.8), sensor false alarms destroying trust, month-end fuel Excel marathon. **Reports:** daily fuel DSR, exception register, vehicle km/l league, station stock audit, OMC match report.

### R-10 Driver
**Profile:** the largest user population and highest design risk (P1 D.2, D.9); personal Android (₹6–15K), prepaid data, vernacular-first, possibly first-generation smartphone user; hostile network conditions; treats the phone as personal property, the app as management's eye. **Responsibilities:** duty acceptance & readiness, daily walk-around inspection, trip execution (milestones, documents, ePOD), expense capture, incident reporting (breakdown/accident SOS), khata awareness, document carriage (digital copies for checkpoints). **Daily tasks:** accept duty → inspection checklist (photo-based, 2 min) → trip start (odometer photo) → drive (app passive: navigation hand-off, milestone auto-capture via geofence) → fuel/toll/expense capture as-they-happen (photo + amount, 15 seconds each) → ePOD at drop → trip close (odometer photo) → view khata update. **Permissions:** own duties/trips/khata/documents only; SOS always available (even logged out); zero visibility of other drivers/vehicles/rates. **Screens:** today's duty card, inspection wizard, trip screen (one primary action at a time), expense quick-add, ePOD capture, my khata, my documents, SOS. **KPIs (driver-facing, gamified carefully):** safety score, km/l vs norm (with incentive ₹ shown), on-time %, inspection compliance. **Pain today:** settlement opacity (the #1 grievance and churn driver — P1 F.6), advance disputes, blamed via unverifiable data, checkpoint harassment when papers are with the office. **Reports:** monthly earnings/settlement statement (downloadable — doubles as income proof for loans; a retention feature). *(Adoption rule from P1 D.2: nothing operationally critical may **require** the driver app; every driver action has a coordinator fallback.)*

### R-11 Vendor (transporter / garage / fuel / hire vendor — portal user)
**Profile:** external; owner or his operator; mobile-first (vendor app/WhatsApp bridge), minimal patience for our UI (P1 D.4). **Responsibilities (transporter archetype):** receive & confirm indents with vehicle+driver details, upload vehicle/driver documents (kept current — their expiry is our gate risk), placement execution, share tracking (device API / SIM consent / driver-app), submit bills against auto-visible trip data, view scorecard & business share, manage their driver roster. **Daily tasks:** morning indent inbox (accept/decline by deadline — silence = auto-decline per BR-VND-04), placement confirmations, document-expiry fixes flagged by the portal, bill submission after ePOD verification. **Permissions:** own indents/trips/bills/documents/scorecard only; no rates of other vendors, no internal data; API access for the sophisticated few. **Screens:** indent inbox, placement tracker, my-fleet documents, bill submission wizard (pre-filled from verified trips — the carrot: bills that verify themselves get paid in 7 days vs 45), scorecard. **KPIs (visible to them — the improvement loop, P1 F.5):** placement compliance, on-time %, document compliance, bill first-pass rate. **Pain today:** indents by phone (deniable), payment black hole ("bill is in process" for 60 days), no idea why business share shrank. **Reports:** monthly business statement, payment status, scorecard trend.

### R-12 Vendor Manager
**Profile:** internal owner of the vendor ecosystem (procurement/logistics side); desktop; commercially sharp. **Responsibilities:** empanelment pipeline (BP-17), contract & rate-card lifecycle (renewals, escalation-clause updates when IOCL diesel moves), scorecard governance and business-share allocation policy, bill-deviation adjudication (the negotiation queue from BP-19), capacity planning with vendors (festival/harvest surge commitments), blacklist/exit management. **Daily tasks:** deviation queue (bills failing auto-verification: approve/negotiate/reject with reason codes); indent-failure review (which vendor declined/ghosted); weekly scorecard publication; monthly business-share proposal to R-02; quarterly rate benchmarking (spot-rate history vs contract — P1 B.22). **Permissions:** vendor CRUD, contract/rate-card CRUD (activation needs AF-06 approval), scorecard config, deviation adjudication ≤ threshold, blacklist proposal. **Screens:** vendor 360° (contracts, fleet, performance, financials), rate-card studio (with escalation formula builder), deviation workbench, scorecard console, capacity board. **KPIs:** placement compliance by vendor, cost vs market benchmark, deviation leakage caught (G1b), settlement cycle days, vendor concentration index. **Pain today:** rate cards in Excel with manual escalation math, bill fights consuming week one of every month, scorecards that exist only in his memory. **Reports:** vendor scorecards, rate benchmark pack, deviation/leakage register, concentration & dependency analysis.

### R-13 HR Manager
**Profile:** plant/company HR handling driver workforce + (in corporates) ETS policy; desktop; HRMS-native. **Responsibilities:** driver hiring pipeline coordination (with R-03), verification SLAs (police/medical), disciplinary process on violations (telematics evidence → inquiry per standing orders), duty-hour legal compliance (OSH Code — P1 I.3), payroll inputs (attendance, OT, bhatta, incentives, recoveries from FMS), ETS policy (eligibility, women-safety rules), roster feeds. **Daily tasks:** verification queue, incident-inquiry files, monthly payroll-input sign-off (the FMS-computed components), quarterly duty-hour compliance review. **Permissions:** driver personnel data (sensitive scope), verification status updates, inquiry records; read-only operational data; payroll-input export approval. **Screens:** driver personnel register, verification tracker, inquiry casefile, payroll-input workbench, duty-hour compliance dashboard. **KPIs:** verification TAT, driver retention (churn 30–50% baseline — P1 B.7), duty-hour violations →0, inquiry closure days. **Pain today:** driver files in cupboards, payroll disputes from unverifiable trip/OT data, zero defensible evidence in labour disputes. **Reports:** headcount & churn, OT/violation register (statutory), verification status, payroll input pack.

### R-14 Finance Manager
**Profile:** controller for transport spend; desktop; ERP-native (SAP/Oracle/Tally). **Responsibilities:** budget setting per cost center (POL/maintenance/hire/tyres heads — P1 A.7 pattern generalizes), commitment control (approvals consume budget — AF engine hook), vendor payment governance (3-way match: contract-rate × verified-trip × bill), GST/GTA treatment correctness (RCM vs FCM per contract — P1 I.2), TDS on freight, capex (vehicle purchase/disposal financials), insurance premium & claim ledger, cost-per-km sign-off (the number of record). **Daily tasks:** payment-run approvals, budget-exception queue, month-end: cost-center recharge run (BP-27), GST input register review, capex file processing. **Permissions:** financial masters (budgets, tax codes, recharge rates), payment approval per AF-07, ledger exports; read-only ops. **Screens:** budget vs actuals by cost center, payment workbench, tax treatment register, capex tracker, costing cockpit. **KPIs:** budget variance, payment cycle compliance, GST credit accuracy, leakage caught (G1b), audit adjustments →0. **Pain today:** transport spend is a black box until Tally entries land; GTA RCM errors surface in GST audits; no commitment view (budgets discovered blown). **Reports:** spend by head/cost center/vehicle, commitment vs budget, GST/GTA register, TDS register, capex & depreciation schedule.

### R-15 Accounts Executive
**Profile:** the doer under R-14; desktop; Tally/ERP + Excel life. **Responsibilities:** bill data entry & 3-way match execution, payment file preparation, driver settlement disbursals (UPI batch), fuel/toll statement imports, debit-note issuance (damages/shortages/penalties), ledger reconciliations (FASTag float, fuel-card credit, insurance), ERP voucher posting/export. **Daily tasks:** verified-bill queue → voucher prep; settlement disbursal batch; statement imports (bank/OMC/FASTag); exception fixes (unmatched transactions). **Permissions:** transactional finance CRUD below approval thresholds; no master/rate changes; no approval powers (P1 F.11). **Screens:** bill processing queue, disbursal workbench, statement import console, reconciliation workbench, debit-note register. **KPIs:** bills processed/day, first-pass voucher accuracy, unreconciled aging, disbursal TAT. **Pain today:** manual annexure typing (P1 A.10), chasing sign-offs, month-end 14-hour days. **Reports:** AP aging (transport), disbursal register, reconciliation status.

### R-16 Security Gate Operator
**Profile:** guard/security supervisor at plant/campus gates; gatehouse kiosk/tablet, gloves-and-rain reality; minimal typing tolerance; often outsourced staff with high rotation. **Responsibilities:** gate-in/out execution (BP-25): identity & document verification (driver DL vs system, vehicle docs green?), seal checks, visual inspection (tyre serials on flagged vehicles — P1 B.38 fraud catch), weighbridge coordination, visitor-vehicle logging, detention timestamp integrity (his timestamps are money — P1 A.1), incident first-report (gate damage observations feed B.11). **Daily tasks:** scan/enter vehicle at barrier → system shows go/no-go with reason (expired document = red banner + who to call) → capture photos (load, seals, odometer if required) → print/issue gate pass → outbound mirror. **Permissions:** gate event CRUD at own gate; view-only vehicle/driver verification data (minimal fields — privacy); cannot override reds (calls R-04/R-02; override happens remotely, logged). **Screens:** gate console (one screen: plate in → verdict + checklist + camera), gate register (auto-built), expected-vehicles list (pre-authorized by dispatch). **KPIs:** gate TAT, verification compliance (no red passed), register completeness. **Pain today:** paper registers illegible in rain, no way to verify documents at 2 a.m., blamed for both delays and lapses. **Reports:** gate register (statutory/audit format), detention timestamp extract, red-stop log.

### R-17 Employee (requester / commuter)
**Profile:** any staff member consuming transport services; personal smartphone; consumer-app expectations (Uber-grade UX is the mental benchmark). **Responsibilities (as a user):** raise transport/cab requests within entitlement, ETS roster confirmation & no-show discipline, OTP boarding/drop confirmation (safe-drop chain — P1 A.9), rating/feedback, SOS use in genuine emergencies. **Daily tasks (ETS commuter):** check pickup time & vehicle; board with OTP; track ETA; logout trip mirror. (Requester:) raise request → track approval → receive vehicle details → confirm completion. **Permissions:** own requests/trips only; book within entitlement matrix (grade × service class — BR-ETS-01); family/emergency contacts manageable. **Screens:** book-a-ride/request form (3 fields + smart defaults), my trips, live tracking share, SOS, feedback. **KPIs (service-side):** on-time pickup %, wait time, request TAT — the SLAs displayed to them. **Pain today:** phone-call booking, no ETA visibility ("is the cab coming?"), unsafe-feeling night drops, opaque approval status. **Reports:** none; monthly personal trip summary (for reimbursement contexts).

### R-18 Approver (generic capability role)
**Profile:** any manager holding approval authority in a chain (department head, project manager, cost-center owner); email/mobile-first — approvers live in their inbox, not our app. **Responsibilities:** timely disposition (approve/reject/modify/delegate) within SLA (AF engine tracks per-step TATs), budget-aware decisions (commitment view at click), duty of care on overrides (their name is on the audit log). **Daily tasks:** approval inbox sweep 2–3×/day; each item shows: what, who, cost, budget remaining, policy flags, history — decision in ≤30 seconds or it will be rubber-stamped (design constraint). **Permissions:** approve within delegated authority matrix only; delegation windows (leave); no self-approval (BR-FIN-02); modify-and-return semantics per AF spec. **Screens:** approval inbox (web/mobile/email-actionable), item detail with context panel, my-delegations. **KPIs:** approval TAT vs SLA, escalation rate, post-facto regularizations (should trend →0). **Pain today:** approval requests arrive as WhatsApp forwards with zero context; signature registers for CYA. **Reports:** my pending/disposed log, delegation audit.

### R-19 Management (CXO / Owner / Board)
**Profile:** consumes outcomes, not screens; mobile + monthly PDF/board pack; 90 seconds of attention. **Responsibilities:** strategic calls the FMS must inform — fleet expansion/contraction, own-vs-hire mix, vendor strategy, capex, safety governance, ESG posture (Phase 6 roadmap). **Daily/periodic tasks:** glance at the mobile scorecard (5 KPIs, traffic-light); monthly deep pack; exception push only for defined events (fatal accident, compliance breach, budget breach >X%). **Permissions:** read-all (financial + operational rollups); no transactional powers (deliberately — audit cleanliness). **Screens:** executive mobile scorecard, monthly board pack (auto-generated), drill-on-demand analytics. **KPIs:** G1–G9 themselves. **Pain today:** truth arrives quarterly, filtered, and unfalsifiable. **Reports:** board pack (cost, utilization, compliance, safety, vendor, trendlines vs targets), incident flash reports.

### R-20 Auditor (internal / statutory / CAG / client auditor)
**Profile:** time-boxed external or internal examiner; desktop; sampling methodology; hostile-by-design posture. **Responsibilities:** verify control operation (approvals happened, segregation held, overrides justified), sample transactions end-to-end (request→trip→POD→bill→payment — G3 traceability is built for this), statutory register inspection (log books, duty-hour, gate registers), data integrity checks (immutable logs, as-on-date document snapshots). **Tasks:** scoped read-only account for the audit window; run samples; export evidence packs; log findings. **Permissions:** **read-only everything within scope, including audit logs; zero write; access itself is logged and time-boxed.** **Screens:** audit workspace (sampling, traceability chain viewer, register exports, override log, permission-change log). **KPIs (of the audit function):** findings count/severity, repeat findings (G8 target: zero), evidence retrieval time (minutes, not days). **Pain today:** evidence archaeology across registers/Excel/emails; unverifiable approvals. **Reports:** control-operation report, override register, exception samples, user-access review.

### Extended roles (observed in P1; brief's "not limited to")

**R-21 Compliance Officer** — dedicated document/compliance owner in 200+ fleets (else a Fleet Manager hat). Owns the compliance calendar end-to-end, renewal vendor management, challan handling (BP-16), regulatory-change watch (P1 D.5), statutory filings. Screens: compliance command center, challan workbench, renewal pipeline. KPIs: zero-expiry days, challan aging, renewal cost variance. 

**R-22 ETS / Cab Coordinator** — specialization of R-05 for people movement: roster ingestion, routing runs, escort assignment, no-show handling, vendor cab billing prep. Screens: roster console, routing workbench, live commute board, escort tracker. KPIs: on-time pickup, occupancy, safe-drop 100%, cost/employee-trip. 

**R-23 Storekeeper (Parts)** — owns BP-21/22 execution: GRN, binning, issues against job cards, counts, min/max alerts, core/warranty returns. Screens: store console, GRN wizard, issue counter, count sheets. KPIs: stock-out vehicle-down incidents, inventory turns, count variance, zero issue-without-job-card. 

**R-24 Weighbridge Operator** — captures tare/gross, binds weights to trip/LR, flags overload (BR-TRP-11 hard stop), prints slips. Often integrated (P1 D.6: serial-port relics) rather than human-keyed. Screens: weighment console (auto-capture preferred). KPIs: weighment-to-trip binding %, manual-entry rate (should →0).

---

## 5. Permission Model (business-level)

### 5.1 Taxonomy
Permissions are expressed as **module.capability.scope**:
- **Modules:** VEH, DRV, TRP, REQ (requests), DSP (dispatch), ETS, FUEL, MNT (maintenance/workshop), INV (parts), TYR, VND, CON (contracts/rates), FIN (billing/payments), CMP (compliance/documents), TOL (toll/FASTag), GTE (gate/weighbridge), GPS, RPT (reports), ADM (administration), AUD (audit views).
- **Capabilities:** view, create, edit, submit, approve, override, configure, export, delete-request (soft; hard delete doesn't exist for transactional data — BR-SEC-01).
- **Scopes:** own | site | region | entity | group; plus data-class scopes: financial, personal-sensitive (DPDP), rates.

### 5.2 Role × module business matrix
(✔ full within scope · ▲ limited as described in role sheet · 👁 view-only · ✖ none. Machine-readable CRUD×scope matrix is a Phase 4 deliverable.)

| Role | VEH | DRV | TRP/DSP | REQ | ETS | FUEL | MNT/INV | VND/CON | FIN | CMP | GTE | GPS | RPT | ADM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-01 Super Admin | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ▲cfg | ✔ | ✔ |
| R-02 Transport Head | ✔ | ✔ | ✔+ovr | ✔apr | ✔ | ✔ | ✔apr | ✔apr | ▲apr | ✔+ovr | 👁 | ✔ | ✔ | ▲policy |
| R-03 Fleet Manager | ✔ | ▲ | 👁 | 👁 | ✖ | 👁 | ▲apr | 👁 | ✖ | ✔ | 👁 | ✔ | ✔ | ✖ |
| R-04 Dispatcher | 👁 | 👁 | ✔ | ✔process | ✖ | ▲indent | 👁 | ▲indent | ✖ | 👁 | ✔pre-auth | ✔ | ▲ops | ✖ |
| R-05 Coordinator | 👁 | ▲attend | ▲duty | ✔intake | ✖ | ▲entry | ✖ | ✖ | ✖ | ▲upload | 👁 | 👁 | ▲site | ✖ |
| R-06 Workshop Mgr | 👁 | ✖ | 👁 | ✖ | ✖ | ✖ | ✔ | ▲garage | ✖ | ▲fitness-prep | ✖ | 👁DTC | ▲shop | ✖ |
| R-07 Maint. Engineer | 👁 | ✖ | ✖ | ✖ | ✖ | 👁 | ✔tech | 👁 | ✖ | 👁 | ✖ | ✔DTC | ✔tech | ▲PM-cfg |
| R-08 Mechanic | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ▲own-tasks | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| R-09 Fuel Manager | 👁 | 👁 | 👁 | ✖ | ✖ | ✔ | ✖ | ▲fuel-vnd | ✖ | ✖ | ✖ | ▲fuel-alerts | ✔fuel | ✖ |
| R-10 Driver | ✖ | ▲own | ▲own | ✖ | ✖ | ▲own-capture | ▲defect | ✖ | ▲own-khata | ▲own-docs | ✖ | ✖ | ✖ | ✖ |
| R-11 Vendor | ▲own-fleet | ▲own-drivers | ▲own-trips | ✖ | ✖ | ✖ | ✖ | ▲own | ▲own-bills | ▲own-docs | ✖ | ▲share | ▲own | ✖ |
| R-12 Vendor Manager | ✖ | ✖ | 👁 | ✖ | ✖ | ✖ | ✖ | ✔ | ▲deviation | 👁vendor-docs | ✖ | 👁 | ✔vendor | ✖ |
| R-13 HR | ✖ | ✔personnel | 👁 | ✖ | ▲policy | ✖ | ✖ | ✖ | ▲payroll-in | 👁DL | ✖ | ▲incident | ✔HR | ✖ |
| R-14 Finance | 👁 | ✖ | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | ✔ | 👁 | ✖ | ✖ | ✔fin | ▲fin-cfg |
| R-15 Accounts | ✖ | ✖ | 👁 | ✖ | ✖ | ▲import | ✖ | 👁 | ▲txn | ✖ | ✖ | ✖ | ▲fin | ✖ |
| R-16 Gate | 👁verify | 👁verify | ▲gate-events | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | 👁status | ✔own-gate | ✖ | ▲gate | ✖ |
| R-17 Employee | ✖ | ✖ | ▲own | ✔own | ▲own | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ▲own-trip | ✖ | ✖ |
| R-18 Approver | 👁ctx | 👁ctx | 👁ctx | ✔apr | ✔apr | ✔apr | ✔apr | ✔apr | ✔apr | ✔apr | ✖ | ✖ | ▲own | ✖ |
| R-19 Management | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | ✔ | ✖ |
| R-20 Auditor | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | ✔+audit | 👁logs |

### 5.3 Structural rules
1. **Scope inheritance:** permissions bind to org-hierarchy nodes; a region-scoped Fleet Manager sees all child sites, nothing lateral (P1 D.3).
2. **Data-class overlays:** `rates`, `financial`, and `personal-sensitive` classes require explicit grants on top of module access (a dispatcher sees the vendor, never the rate; gate sees DL validity, never DL address — DPDP minimization).
3. **Segregation constraints (hard, from P1 F.11):** requester≠approver; estimate-creator≠estimate-approver (above threshold); fuel-issuer≠fuel-reconciler; vendor-manager≠bill-payer; admin≠operational-financial actor. The RBAC engine must *validate role-stacks against these constraints at grant time*, not trust process.
4. **Override doctrine (P1 F.4):** overrides are permissions of their own (CMP.override, TRP.override), always with: mandatory reason code + free text, automatic notification to R-02 + R-20 visibility, and time-bound effect (an override clears one event, never a class of events).
5. **Delegation:** time-boxed, scope-equal-or-narrower, self-expiring, audit-logged; no chained re-delegation.
6. **Break-glass:** an emergency access role (sealed, dual-authorized, 4-hour expiry) for 2 a.m. incidents — used is better than shared passwords; every use triggers next-morning review.

## 6. Business Process Catalog

28 processes. Format: **Trigger/Frequency · Steps · RACI · Inputs → Outputs · Exceptions · Integration touchpoints.** RACI uses role IDs (R=Responsible, A=Accountable, C=Consulted, I=Informed). Each BP maps to Phase 1 sections (cited) and will become module user-flows in Phase 3.

### BP-01 Vehicle onboarding (P1 B.3)
**Trigger:** PO/lease signed or hired-dedicated vehicle inducted; per event. **Steps:** 1) Create vehicle shell from PO/RC (VAHAN pull via verification API where available); 2) commissioning checklist — registration, HSRP, insurance policy bound, fitness, permit application, AIS-140 fitment + VAHAN linkage, FASTag issued, fuel card enrolled, body/calibration certificates, accessories, branding; 3) financial setup — capitalization/lease record, depreciation params, cost center; 4) operational setup — class, capacity, tare, meters (opening odometer/hours), PM schedule binding, home site, device pairing; 5) checklist gate review; 6) state → Active (P1 C.1). **RACI:** R: R-03; A: R-02; C: R-14 (financials), R-01 (device/config); I: R-04. **Inputs→Outputs:** PO, RC, policies → allocable vehicle with complete 360° record. **Exceptions:** chassis-purchased trucks (body-building interlude with vendor tracking); hired vehicles get "lite onboarding" (documents + tracking + rate binding only). **Integrations:** VAHAN/aggregator, insurer, OMC, FASTag issuer, ERP asset register.

### BP-02 Vehicle disposal / condemnation (P1 B.3, A.7)
**Trigger:** de-fleet decision (economics/regulatory/utilization) or condemnation-board schedule; monthly batch or per event. **Steps:** 1) disposal proposal auto-armed with evidence pack (cost/km trend, downtime, book vs market value, utilization); 2) approval per AF-08; 3) government flavor: survey/condemnation board minutes recorded; 4) mode selection — auction (MSTC/GeM/dealer)/buyback/scrappage (RVSF → Certificate of Deposit for tax concession); 5) pre-sale strip (fuel card, FASTag closure, device recovery, spare wheel/toolkit per checklist); 6) sale execution + gate-out with release note; 7) VAHAN transfer/deregistration tracked to completion (liability tail until transfer!); 8) financial closure — ledger, P&L on disposal, insurance refund; 9) state → Disposed with lifecycle TCO report. **RACI:** R: R-03; A: R-02 (R-19 above value threshold); C: R-14, R-21; I: R-01, R-04. **Exceptions:** total-loss write-offs (insurer settlement path); theft (FIR → untraceable certificate → claim). **Integrations:** VAHAN, auction platforms, ERP.

### BP-03 Transport request → goods trip (P1 B.2, B.27)
**Trigger:** department/customer demand; continuous. **Steps:** 1) request intake (form/API/ERP order feed) with load, O-D, window, cost center; 2) validation & completion (R-05); 3) approval per AF-01 (entitlement + budget); 4) → dispatch pool; 5) planning: club/load-build (BP-06 execution follows). **RACI:** R: R-05/requester; A: cost-center owner (R-18); C: R-04; I: R-02. **Exceptions:** emergency regularization path (execute-then-approve, flagged — AF-01 note); recurring requests (templates with standing approval). **Integrations:** ERP sales/purchase orders, e-way bill readiness check.

### BP-04 Passenger duty request (pool car / cab) (P1 B.23)
**Trigger:** employee/officer need; continuous. **Steps:** 1) booking within entitlement matrix; 2) approval per AF-02 (auto below threshold); 3) allocation: pool first, vendor spill with reason; 4) duty slip issued (digital); 5) execution with OTP start/close, km + waiting captured; 6) passenger e-sign/OTP closure; 7) costing to cost center; personal-use recovery flagged where applicable. **RACI:** R: R-05/R-22; A: R-02; I: R-14 (recovery), requester. **Exceptions:** VIP/protocol duties (pre-emption rules); outstation multi-day (advance + bhatta attach). **Integrations:** HRMS (grades/entitlements), payroll (recoveries).

### BP-05 Daily dispatch planning (P1 B.26)
**Trigger:** T−1 evening freeze + T-day continuous re-plan. **Steps:** 1) demand pool review (approved requests, standing orders); 2) capacity check (availability computation — vehicles, drivers, vendor commitments); 3) load building (BP: weight/volume/compat validation per P1 B.29); 4) assignment (owned first-fill policy, else vendor indent per contract share); 5) constraint validation (compliance gates, duty-hours, overlaps — BR set); 6) publish (duty sheets, indents, gate pre-auth, customer ASN); 7) intraday re-plan loop with change-reason codes. **RACI:** R: R-04; A: R-02; C: R-12 (vendor capacity), R-06 (releases); I: R-16, requesters. **Exceptions:** plan overridden by management directive (logged); force-majeure day (strike/flood — bulk defer tooling). **Integrations:** ERP orders, vendor portal, gate.

### BP-06 Trip execution & closure (P1 B.6)
**Trigger:** dispatch; continuous. **Steps:** 1) pre-trip: driver inspection checklist, document pack verification (auto), advance issue if due (AF-04); 2) gate-out (BP-25) with odometer photo; 3) e-way bill Part B bound; 4) en-route: geofence milestones auto-log; halts/deviations/overspeed alerts per policy; expense capture (driver app); 5) arrival geofence → unloading → ePOD (BP-07); 6) return-leg execution if planned (P1 B.31); 7) trip close: odometer end photo, km reconciliation (GPS vs odo vs plan — 3-source rule P1 F.3), expense sweep; 8) auto-costing posted; 9) → settlement queue (BP-10) and billing queue (BP-19/customer invoicing). **RACI:** R: R-10 (execution), R-04 (control); A: R-02; I: requester/customer. **Exceptions:** vehicle swap mid-trip (EWB Part B update + relink); trip cancellation post-dispatch (partial-cost closure); force-close after 48h driver silence (flagged for audit). **Integrations:** EWB API, GPS, FASTag (toll accrual), customer webhooks.

### BP-07 ePOD & delivery exceptions (P1 B.30)
**Trigger:** arrival at consignee; per drop. **Steps:** 1) capture (OTP/signature/stamped-paper photo — hybrid modes); 2) exception typing at source: clean/short/damaged/refused/unattended, with photos & receiver details; 3) clean → auto-release invoice trigger + EWB closure (post-Aug-2026 API); 4) exceptions → claims workflow: debit-note draft (shortage/damage), return-leg planning (refusal — new EWB), insurer intimation if threshold; 5) POD vault archival (searchable by LR/invoice/EWB). **RACI:** R: R-10; A: R-04; C: R-12 (carrier liability), R-14 (claims); I: customer. **Exceptions:** consignee refuses digital (paper-photo mode is first-class, not fallback); POD fraud checks (blank-paper detection, geo-mismatch flags). **Integrations:** customer portals/EDI, EWB, insurer.

### BP-08 Driver onboarding (P1 B.7)
**Trigger:** hiring need per roster gap analysis; per event. **Steps:** 1) candidate intake (referral/agency) with DL scan; 2) verification battery — SARATHI DL check (API), police verification initiation, medical test booking, blacklist lookup (shared registry), previous-employer reference; 3) skill assessment (vehicle-class road test, scored checklist); 4) onboarding — badge, uniform, bank/UPI, induction modules (safety, app training in vernacular), depot assignment; 5) license-class eligibility matrix bound (drives allocation); 6) state → Active (P1 C.2). **RACI:** R: R-03/HR-exec; A: R-13; C: R-02; I: R-04. **Exceptions:** vendor drivers (lite verification: DL API + badge + induction; vendor attests the rest — their compliance is scorecard-tracked); re-hire of separated drivers (prior-record review gate). **Integrations:** SARATHI/aggregator, police verification services, HRMS.

### BP-09 Driver duty roster (P1 B.20)
**Trigger:** weekly build + daily adjustment. **Steps:** 1) demand forecast (standing trips, ETS shifts, seasonal pattern); 2) roster draft with legal-rule validation (hour caps, rest, spread-over per configurable pack — P1 I.3); 3) fairness pass (rotation of lucrative/hard duties, bhatta distribution view); 4) publish to driver apps (acknowledge required); 5) daily: attendance vs roster, substitution cascade for no-shows (spare pool), swap requests with approval; 6) actual duty hours ledger fed by trip timestamps. **RACI:** R: R-05; A: R-02; C: R-13 (legal), R-04; I: R-10. **Exceptions:** emergency extension past legal limits (documented exception + compensatory rest scheduling + HR notification — BR-DRV-07); strike/mass absence (contingency roster activation). **Integrations:** HRMS attendance/leave, payroll (OT).

### BP-10 Driver khata settlement (P1 A.5, B.7)
**Trigger:** trip close (per-trip settlers) or monthly cycle; high frequency. **Steps:** 1) auto-statement build: advances (cash/UPI/fuel-card allocations) vs captured expenses (fuel, toll-cash, loading labour, food per policy, misc with receipts) vs entitlements (bhatta by trip type, incentives — km/l above norm, on-time) vs recoveries (damages per approved inquiry, challans attributable per policy); 2) driver reviews statement **in-app in vernacular** before sign-off (F.6 transparency); 3) dispute lane: line-item challenge → R-05 resolves with evidence (photos/GPS); 4) approval per AF-04 thresholds; 5) disbursal batch (UPI) by R-15; 6) ledger closes to zero or carries forward with aging. **RACI:** R: R-15; A: R-14; C: R-05 (disputes); I: R-10, R-13 (payroll interface). **Exceptions:** absconding driver (khata freeze, recovery process); negative khata beyond cap (advance block — BR-FIN-06). **Integrations:** UPI/bank disbursal, payroll, fuel-card allocations.

### BP-11 Fuel issue & reconciliation (P1 B.8, B.40)
**Trigger:** continuous (transactions) + daily station cycle + monthly statements. **Steps:** 1) issue events ingested from all channels — card API/statements, own-station dispenser log + dip readings, bowser issue slips (mobile capture), driver cash bills (OCR); 2) each event auto-bound to vehicle+trip+GPS position; 3) reconciliation square run: issued vs sensor-received vs distance vs norm; 4) exceptions queued by type (odd-hour, off-route, volume>tank, no-GPS-at-pump, norm deviation >x%); 5) R-09 disposition with evidence; confirmed leakage → recovery workflow + vendor/pump flag; 6) station stock cycle: purchases (tanker GRN with density check), daily dips, variance ledger; 7) monthly: OMC statement match, rebate verification, norm review pack. **RACI:** R: R-09; A: R-02; C: R-04 (trip context), R-15 (statements); I: R-14, R-10 (their km/l). **Exceptions:** sensor-less vehicles (square runs on 3 sources with wider tolerance); DG sets/PTO consumers (hour-based norms — P1 B.8). **Integrations:** OMC APIs/portals (XTRAPOWER, SmartFleet, DriveTrack+, Jio-bp), fuel sensors via telematics, dispenser controllers.

### BP-12 Preventive maintenance (P1 B.9)
**Trigger:** schedule engine (km/hours/time/condition/statutory — whichever first); continuous horizon 7–15 days. **Steps:** 1) due-list generation with operational calendar overlay; 2) slot negotiation (R-06 proposes, R-04 confirms release — the arbitration is *recorded*, ending the eternal blame cycle); 3) auto job-card with model-specific task list + parts kit reservation; 4) execution per BP-22; 5) QC + road test; 6) counters reset, next-due recomputed; 7) overdue escalation: grace → amber; beyond grace → **maintenance lock** (allocation block, BR-MNT-01) with override only per AF-05. **RACI:** R: R-06; A: R-03; C: R-04, R-07 (schedules); I: R-02. **Exceptions:** en-route PM (highway workshop with retro job card); idle-vehicle time-triggers (batch PM for parked fleet). **Integrations:** telematics odometer/hours feed, DTC feed.

### BP-13 Breakdown handling (P1 B.10)
**Trigger:** driver SOS/report; per event, SLA-timed. **Steps:** 1) ticket auto-created with GPS + symptoms + photos; severity triage (drivable/roadside/tow); 2) response dispatch — mobile mechanic / network garage (geo-search directory) / OEM assistance / crane; 3) load-rescue decision if needed: transship workflow (replacement vehicle, labour, EWB Part B update, document relink); 4) repair execution with en-route payment handling (advance/UPI/account); 5) resume or tow-to-workshop (job card opens, vehicle state → Breakdown/InWorkshop); 6) post-mortem: root cause coded (feeds R-07), costs booked, downtime recorded; PM linkage check ("was PM overdue?" auto-annotated). **RACI:** R: R-04 (coordination), R-06 (repair); A: R-02; C: R-07, R-12 (if vendor vehicle); I: customer, R-19 (if SLA breach). **Exceptions:** night/remote protocol (driver safety checklist first — P1 F.12 SOP wizard); vendor-vehicle breakdown carrying our load (cost-liability per contract clause, tracked). **Integrations:** garage network directory, OEM RSA APIs, EWB.

### BP-14 Accident management (P1 B.11)
**Trigger:** incident report (SOS/gate/police); per event. **Steps:** four parallel tracks from one incident object — 1) *Emergency:* injury triage, hospital, police intimation, site safety, evidence capture (photos, witnesses, dashcam clip pull, telematics 60-second snapshot auto-attached); 2) *Legal:* FIR record, driver statement, document as-on-date snapshot sealed (DL/fitness/permit/insurance validity at incident moment — MACT defense pack); 3) *Insurance:* intimation ≤24h (SLA timer), claim registration, surveyor scheduling **before repair**, estimate approval, repair (cashless network preferred), settlement reconciliation (depreciation/excess vs add-ons); 4) *Internal:* investigation with root cause, driver inquiry per HR process, safety-committee review, corrective actions tracked to closure. **RACI:** R: R-03 (claim), R-04 (response), R-13 (inquiry); A: R-02; C: R-21, legal counsel; I: R-19 (flash report), R-14. **Exceptions:** third-party-only damage (no OD claim — legal track only); total loss (BP-02 write-off path); hit-and-run against us (Solatium process). **Integrations:** insurer/broker APIs, dashcam clip retrieval, police e-FIR references.

### BP-15 Compliance document renewal (P1 B.12–B.16)
**Trigger:** T−30/15/7 calendar (configurable per document type); continuous. **Steps:** 1) renewal task auto-spawned with dependency check (fitness renewal? verify AIS-140 live + tax paid + insurance current first — the graph, P1 Finding 3); 2) assignment (internal clerk or renewal agent/vendor); 3) pre-work where physical (fitness: pre-inspection checklist + workshop slot + ATS appointment); 4) fee payment with government-fee vs service-fee split captured; 5) new document uploaded, verified (data extracted via OCR, validity dates machine-read), VAHAN cross-check where API available; 6) calendar recomputed; vehicle exits ComplianceHold if held. **RACI:** R: R-21 (or R-03); A: R-02; C: R-06 (fitness prep); I: R-04 (availability), R-14 (fees). **Exceptions:** renewal failure (fitness fail → repair loop; permit objection → escalation); document suspended by authority (immediate hold + legal track). **Integrations:** VAHAN/aggregators, ATS booking (where digital), payment gateways.

### BP-16 Challan (violation) handling (P1 B.12)
**Trigger:** challan detected via API sync/driver report/post; continuous. **Steps:** 1) challan ingested & bound to vehicle + (via trip overlay) probable driver; 2) classification: contest vs pay; attribution: company liability (document lapse) vs driver liability (behavioral — overspeed) per policy matrix; 3) payment/contest execution with deadlines; 4) driver-attributed → khata recovery proposal via inquiry-lite flow (driver sees evidence, may contest); 5) pattern analytics (corridor-wise challan hotspots feed route planning). **RACI:** R: R-21; A: R-02; C: R-13 (recoveries), R-10; I: R-14. **Exceptions:** court-referred challans (legal track); challans on sold vehicles (transfer-lag liability — BP-02 tail). **Integrations:** e-challan aggregator APIs (state-coverage caveats per P1 I.4).

### BP-17 Vendor empanelment (P1 B.21)
**Trigger:** capacity gap or vendor application; per event. **Steps:** 1) application with KYC (GST, PAN, bank, cancelled cheque), fleet declaration (RCs — verified via VAHAN API sampling), driver roster; 2) blacklist & concentration check; 3) capability audit (visit/virtual — vehicles, workshop, financial standing) with scored template; 4) contract negotiation → AF-06 approval; 5) portal onboarding + induction; 6) probation period with capped share, auto-review at 90 days. **RACI:** R: R-12; A: R-02; C: R-14 (financial vetting), legal; I: R-04. **Exceptions:** emergency single-trip empanelment (BP-20 spot path with lite KYC, capped exposure). **Integrations:** GST verification API, VAHAN, bank verification.

### BP-18 Vendor indent & placement (P1 A.1, B.21)
**Trigger:** dispatch spill or contracted lane demand; daily. **Steps:** 1) indent issued against contract (lane, vehicle class, date-time, load) — allocation policy: scorecard-weighted share (P1 F.5 loop); 2) vendor accepts by deadline with vehicle+driver identity (declines/silence cascade to next vendor, logged); 3) placement tracking: pre-gate document auto-verification of the offered vehicle (their expired fitness caught *before* the gate, not at it); 4) gate-in confirms placement (timestamp = compliance metric); 5) substitution handling (vendor swaps vehicle → re-verification loop). **RACI:** R: R-04; A: R-02; C: R-12; I: R-16, requester. **Exceptions:** placement failure at cutoff → auto-escalate to spot (BP-20) with failure logged to scorecard; partial placements on multi-vehicle indents. **Integrations:** vendor portal/app, WhatsApp bridge (P1 F.15 — indent links actionable in WhatsApp).

### BP-19 Vendor bill verification & settlement (P1 B.21)
**Trigger:** vendor bill submission (portal); monthly cycles typical. **Steps:** 1) bill lines auto-matched to system trips (3-way: contract rate × verified execution × billed amount); 2) rate engine recomputes expected: base rate + diesel escalation (indexed to base-date IOCL price) + detention (geofence/gate timestamps) − penalties (placement failures, delays per contract) − damage debit notes; 3) auto-pass within tolerance → payment queue; deviations → R-12 workbench (negotiate/adjust/reject with codes); 4) GST treatment applied (RCM/FCM per contract, post-GST-2.0 rates — P1 I.2), TDS computed; 5) approval per AF-07 → payment run → vendor portal updated. **RACI:** R: R-15 (processing), R-12 (deviations); A: R-14; I: R-11, R-02 (leakage stats). **Exceptions:** bills for trips missing in system (the fraud/no-data boundary — hard queue, never auto-pass); credit-note reversals. **Integrations:** ERP AP, GST engine, diesel price index feed.

### BP-20 Spot hire (P1 B.22)
**Trigger:** contracted capacity exhausted; per event, time-critical. **Steps:** 1) requirement broadcast (broker calls today; RFQ blast via portal/WhatsApp later); 2) quote capture with spot-rate history displayed (negotiation armed — P1 B.22); 3) lite verification: RC via API, DL via API, insurer validity, photos; risk score displayed; 4) rate + advance terms recorded (advance-after-loading policy default); 5) tracking by consent-SIM/driver-app link; 6) execution via standard BP-06/07; 7) balance payment against ePOD; vendor auto-archived with performance note (repeat spot vendors graduate to empanelment pipeline). **RACI:** R: R-04; A: R-02 (above rate threshold — AF-06); C: R-12; I: R-14. **Exceptions:** high-value load on spot vehicle (enhanced protocol: seal + escort + geofence corridor + insurer notification per policy). **Integrations:** verification APIs, load-board APIs (roadmap).

### BP-21 Parts purchase & GRN (P1 B.36)
**Trigger:** min/max breach or job-card demand; weekly cycles + urgent. **Steps:** 1) indent (auto from reorder point or manual from job card); 2) quotes (empanelled parts vendors; rate-contract items skip); 3) PO per AF-05 thresholds; 4) GRN with quality check (counterfeit vigilance — brand verification photos), bin allocation; 5) invoice 3-way match → AP. **RACI:** R: R-23; A: R-06; C: R-07 (technical equivalence), R-14; I: R-15. **Exceptions:** emergency local purchase (petty-cash path with post-facto PO, capped); core-exchange purchases (old-unit credit tracked). **Integrations:** ERP procurement (or native lite-procurement for non-ERP customers).

### BP-22 Parts issue & job costing (P1 B.36–37)
**Trigger:** job-card task needs part; continuous. **Steps:** 1) issue strictly against job card (BR-MNT-06), serials captured for tracked items (tyres/batteries); 2) old-part return logged (scrap/warranty/core routing); 3) labour time clocked per task; 4) outside-work POs attached; 5) job close → full cost (parts+labour+outside) posts to vehicle ledger; warranty-eligible lines auto-routed to claims. **RACI:** R: R-23 (issue), R-08 (consumption), R-06 (close); A: R-06; I: R-14. **Exceptions:** cannibalization (inter-vehicle transfer record mandatory — P1 B.36); returns of unused parts (restock with condition check). **Integrations:** none external (internal ledger), warranty portals where OEM-digital.

### BP-23 Tyre lifecycle events (P1 B.38)
**Trigger:** fitment/rotation/inspection/removal/retread/scrap/claim events; continuous. **Steps:** per event — serial-verified capture: fitment (vehicle+position+odometer), inspection (tread mm, pressure, photos), rotation (position swap map), removal (reason-coded: worn/damage/premature), retread round-trip (vendor, cost, new serial suffix), scrap (weight, sale value), warranty claim (evidence pack). CPK (cost per km) auto-computed per casing across lives; brand/pattern league updates. **RACI:** R: R-23/R-06 (events), R-03 (program); A: R-03; C: R-07; I: R-02 (CPK league), R-16 (gate serial audits). **Exceptions:** serial unreadable (re-branding process); casing lost at retreader (claim on vendor). **Integrations:** TPMS feeds (where fitted), retreader portals (rare — manual default).

### BP-24 ETS daily cycle (P1 A.9, B.24)
**Trigger:** roster feed (HRMS) T−1; daily, shift-multiplied. **Steps:** 1) roster ingestion & delta detection (the 8 p.m. change wave); 2) routing run (clustering per capacity/ride-time/zone/women-safety constraints) — minutes, not hours (PP-14); 3) escort assignment where rules trigger; 4) publication (drivers, employees with OTPs, guards); 5) execution: OTP boarding, live ETA, no-show marking (3-min rule then depart), campus gate-in; 6) logout mirror with **safe-drop chain**: OTP at each drop, last-woman-drop monitoring on the live board until 100% confirmed; 7) daily vendor-km lock (GPS-verified) feeding monthly billing; 8) exceptions: breakdown mid-chain (backup cab SLA timer), adhoc bookings per AF-02. **RACI:** R: R-22; A: R-02; C: R-13 (policy), R-12 (vendor); I: employees, security. **Exceptions:** escort unavailable (route re-sequenced so no woman is last — hard rule BR-ETS-03); panic event (SOS protocol: control room + security + emergency contacts). **Integrations:** HRMS roster API, campus access-control, vendor apps.

### BP-25 Gate in/out & weighbridge (P1 A.1, B.29)
**Trigger:** vehicle at barrier; continuous. **Steps:** 1) identification (plate entry/ANPR/expected-list match); 2) system verdict: documents green? driver matches? pre-authorized? → go/no-go banner with reason; 3) inbound: tare weighment bound to trip/PO, load/seal photos; 4) outbound: gross weighment, overload check (BR-TRP-11 hard stop), invoice/EWB verification, gate pass issue; 5) timestamps seal detention clocks (start/stop per contract free-time terms); 6) register auto-built (statutory format export). **RACI:** R: R-16, R-24; A: site security head; C: R-04 (pre-auth), R-05; I: R-12 (detention data). **Exceptions:** manual gate (power/system down — paper fallback with photo-based retro entry, flagged); visitor/non-trip vehicles (lite log). **Integrations:** weighbridge controllers (serial/IP), ANPR cameras, plant ERP gate modules where present.

### BP-26 FASTag & toll reconciliation (P1 B.17–18)
**Trigger:** continuous debits; monthly statements. **Steps:** 1) tag registry health sweep (balance, blacklist status) — pre-dispatch check surfaced to R-04 (BR-TRP-09); 2) recharge workflow (float management, finance approval per threshold); 3) debit ingestion (issuer statements/APIs); 4) auto-match debits to trips via GPS-path plaza crossings; 5) exceptions: double deduction (dispute filing with issuer, tracked to refund), phantom plaza (GPS never there), class-mismatch charge, personal-detour toll (khata recovery proposal); 6) cash-toll receipts (FASTag failure cases) OCR'd and matched; 7) monthly toll cost per corridor analytics feed route planning. **RACI:** R: R-15; A: R-14; C: R-04, R-09; I: R-10 (recoveries). **Exceptions:** MLFF/ANPR debits (no plaza stop — match logic on gantry geofences); state plazas outside NETC (manual lane). **Integrations:** issuer bank statements/APIs, NETC dispute processes.

### BP-27 Monthly costing & cost-center recharge (P1 B.34)
**Trigger:** month-end; monthly. **Steps:** 1) cost sweep completeness check (open trips, unposted job cards, unswept expenses — exception list to owners); 2) allocation runs: shared costs (workshop overhead, spare vehicles) per configured drivers (activity-based defaults); 3) per-vehicle P&L/cost-sheet computed (full stack per P1 B.34); 4) cost-center recharge journal (internal hire rates × usage) → ERP export; 5) variance pack vs budget; 6) cost/km league published (P1 F.1); 7) close lock (period sealed; adjustments only via next-period entries — audit discipline). **RACI:** R: R-15; A: R-14; C: R-02 (variance narrative); I: R-19, cost-center owners. **Exceptions:** disputed allocations (adjustment workflow with dual sign-off). **Integrations:** ERP GL export (SAP/Oracle/Tally connectors).

### BP-28 Fleet right-sizing review (P1 B.33, F.13)
**Trigger:** annual budget cycle + on-demand; periodic. **Steps:** 1) auto-generated pack: utilization hierarchy per vehicle/site, cost/km trends, hire-spend vs owned-capacity analysis, seasonal patterns YoY, replacement candidates (economics crossover per P1 B.35); 2) scenario modeling (dispose N, redeploy M, hire-convert K → projected cost); 3) decision workshop (R-02 + R-19 + R-14); 4) approved actions spawn: BP-02 disposals, AF-03 requisition transfers, procurement cases, vendor-contract adjustments; 5) decisions tracked to realized savings (the ROI loop for G1). **RACI:** R: R-03 (pack), R-02 (proposal); A: R-19; C: R-14, R-12; I: all site heads. **Integrations:** none new — consumes the ledger.

---

## 7. Approval Flow Catalog

The approvals engine (P1 P4) executes these declaratively configured flows. Common mechanics for all: SLA timers per step with reminder → escalation; delegation per §5.3; modify-and-return semantics; parallel steps supported; budget commitment on approval; full audit trail; emergency **regularization lane** (execute-first, approve-within-72h, distinct audit flag, abuse-rate monitored).

| AF | Flow | Trigger object | Chain (typical defaults — all configurable) | Thresholds (defaults) | SLA/step |
|---|---|---|---|---|---|
| AF-01 | Goods transport request | BP-03 request | Auto-approve → Dept head → Transport head → +Finance (parallel) | ≤₹2K auto; ≤₹25K dept; ≤₹1L +TH; >₹1L +Fin | 4h |
| AF-02 | Passenger/cab booking | BP-04 booking | Entitlement auto → Dept head (outside entitlement) → TH (outstation/multi-day) | in-matrix auto | 2h |
| AF-03 | Vehicle requisition (resource) | BP-28-type requisition | Site head → TH → +Finance (if hire/purchase spawned) | ≤30 days TH; > → +R-19 | 24h |
| AF-04 | Driver advance / fuel indent / settlement | BP-06/10/11 | Auto per policy limits → R-05 → R-02 | advance ≤ policy/trip auto; settlement ≤₹5K var auto; above → chain | 2h |
| AF-05 | Maintenance estimate / PO / PM-lock override | BP-12/21/22 | R-06 → R-03 → R-02; technical parallel: R-07 | ≤₹10K R-06; ≤₹50K R-03; > R-02; PM-override always R-02 | 4h |
| AF-06 | Vendor contract / rate card / spot rate above cap | BP-17/18/20 | R-12 → R-02 → +R-14 → R-19 (annual value > cap) | rate-card activation always dual (R-12+R-02) | 48h |
| AF-07 | Vendor bill / payment run | BP-19 | Auto-pass (tolerance) → R-12 (deviation) → R-14 → payment release | tolerance ±0.5% or ₹500/bill; batch release dual | 24h |
| AF-08 | Vehicle disposal / write-off | BP-02 | R-03 → R-02 → R-14 → R-19 (above book-value cap) | condemnation board step for govt profile | 7d |
| AF-09 | Compliance override (allocation with red doc) | any dispatch block | R-02 only, reason-coded, auto-notify R-20/R-19 | never delegatable below R-02 | 30m |
| AF-10 | Accident expense / claim acceptance | BP-14 | R-03 → R-02 → R-14 (settlement acceptance above X) | insurer-settlement shortfall >20% → R-19 visibility | 24h |
| AF-11 | Budget exception / reallocation | BP-27 variance | Cost-center owner → R-14 → R-19 | >10% head variance | 72h |
| AF-12 | Master/policy change (rates, norms, rules, RBAC) | config changes | Dual control: proposer + R-02/R-01 counterpart; rule-pack changes versioned with effective dates | all | 48h |

---
## 8. Business Rules Catalog

Enforcement legend: **H** = hard block (system prevents the action) · **S** = soft warn (proceed allowed, warning logged) · **E** = escalate (allowed only via named approval) · **A** = automation (system acts autonomously). Override column: role that may override via AF-09/AF-05-type flows; "—" = no override exists. All rule parameters (thresholds, grace periods, tolerances) are tenant-configurable with versioned effective dates (P1 D.5); defaults shown.

### 8.1 Vehicle rules (BR-VEH)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-VEH-01 | A vehicle cannot be allocated/dispatched unless state = Active (never InWorkshop, Breakdown, Accident, ComplianceHold, Suspended, DisposalPending) | H | R-02 (AF-09, per event) |
| BR-VEH-02 | A vehicle cannot hold two overlapping trip assignments (time-window overlap check at assignment commit — DB-level) | H | — |
| BR-VEH-03 | Odometer/hour readings must be monotonic; a lower reading than last requires meter-replacement workflow with offset | H | R-03 via workflow |
| BR-VEH-04 | Load assignment cannot exceed rated payload (GVW − tare) or volume capacity | H | R-02 (documented, axle-check attached) |
| BR-VEH-05 | Vehicle class must match load/passenger type (reefer for cold chain, tanker calibration for liquids, PSV for passengers) | H | — |
| BR-VEH-06 | Route assignment must be within permit geography (state permit ≠ interstate trip) | H | R-02 (temporary permit workflow spawned) |
| BR-VEH-07 | New vehicle cannot enter Active until commissioning checklist 100% (BP-01) | H | R-02 (deficiency list attached, 7-day cure) |
| BR-VEH-08 | Vehicles idle >72h (config) auto-flag to idle board with reason-code demand | A/S | n/a |
| BR-VEH-09 | Vehicle crossing maintenance-cost threshold (rolling 12m > x% of replacement EMI) auto-arms disposal proposal | A | n/a |
| BR-VEH-10 | Meter reading required at trip start & close (photo); trips cannot close without end odometer | H | R-05 (manual entry, flagged) |
| BR-VEH-11 | GPS-vs-odometer variance >5% (config) on trip close queues a review exception | A/S | n/a |
| BR-VEH-12 | Vehicle transfer between entities requires financial recharge record + document re-verification | H | — |
| BR-VEH-13 | Age/registration caps by profile (e.g., NCR 10y diesel) block allocation into restricted geographies | H | — |
| BR-VEH-14 | Devices unlinked/silent >24h put vehicle in "untracked" dispatch tier (visible warning on assignment) | S | R-04 acknowledges |
| BR-VEH-15 | Disposal cannot complete until FASTag closed, fuel card deactivated, device recovered, insurance addressed (checklist) | H | R-02 (item-wise waiver, logged) |

### 8.2 Driver rules (BR-DRV)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-DRV-01 | Driver cannot be assigned without valid DL of matching class for the vehicle (license-class eligibility matrix) | H | — |
| BR-DRV-02 | DL/badge/medical expiry ≤30 days → warning on every assignment; expired → CredentialHold, no assignment | S→H | R-02 (never for expired DL — that stays H) |
| BR-DRV-03 | A driver cannot hold two overlapping duties/trips | H | — |
| BR-DRV-04 | Max driving hours per duty per configured legal pack (India default 8h, ext. 10h approved routes) — assignment exceeding projected hours blocked | H | R-02 + HR notify (emergency exception, compensatory rest auto-scheduled) |
| BR-DRV-05 | Mandatory rest: ≥30 min after 5h continuous driving (pack-configurable); en-route alert to driver + dispatcher on projected breach | S/A | n/a |
| BR-DRV-06 | Spread-over ≤12h/day; weekly ≤48h (pack); roster builds violating limits cannot publish | H | R-13 (documented legal exception) |
| BR-DRV-07 | Duty extension past legal limit mid-execution (breakdown etc.) auto-generates exception record + rest compensation task | A | n/a |
| BR-DRV-08 | Night driving policy: driver+route combinations flagged no-night cannot be dispatched into night windows | H | R-02 |
| BR-DRV-09 | Hazardous load assignment requires hazardous endorsement + training validity | H | — |
| BR-DRV-10 | New driver (probation) cannot take high-value/hazardous/VIP duties (config list) | H | R-02 |
| BR-DRV-11 | Driver with safety score below floor (config) auto-restricted to supervised duties + coaching task spawned | A/E | R-02 |
| BR-DRV-12 | Absconding protocol: no-show + unreachable > policy days → khata freeze + asset trace + HR case | A | n/a |
| BR-DRV-13 | Separation blocked until khata = 0 (recovered or written off per AF-04) and assets returned (card, badge, device) | H | R-13+R-14 dual |
| BR-DRV-14 | Blacklisted driver (any group entity) cannot be onboarded; match on DL number + identity | H | R-02+R-13 dual (documented) |
| BR-DRV-15 | Vendor-supplied driver must pass same DL-API verification before first gate-in | H | — |

### 8.3 Trip & dispatch rules (BR-TRP)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-TRP-01 | No trip without an approved request/order lineage (except regularization lane, distinctly flagged, ≤72h approval) | H | per AF-01 |
| BR-TRP-02 | Duplicate-trip detection: same O-D + load ref + window across requests → merge prompt (duplicate LR/billing prevention) | S | R-04 confirms distinct |
| BR-TRP-03 | Vehicle overlap: enforced by BR-VEH-02 at commit; UI shows conflicts live during planning | H | — |
| BR-TRP-04 | Driver overlap: enforced by BR-DRV-03 at commit | H | — |
| BR-TRP-05 | Trip time-window feasibility: dispatch blocked if planned distance ÷ legal driving hours > window (impossible schedules are unsafe schedules) | S/E | R-02 |
| BR-TRP-06 | E-way-bill-required loads cannot gate-out without valid EWB bound (value ≥ threshold per state config) | H | R-02 (reason: exemption category, logged) |
| BR-TRP-07 | EWB expiry projection: if remaining validity < remaining distance ÷ 200 km/day, alert at planning and en-route (extension window 8h — P1 I.2) | A/S | n/a |
| BR-TRP-08 | Mid-trip vehicle swap requires transshipment workflow (EWB Part B update + document relink) — cannot simply reassign | H | — |
| BR-TRP-09 | Pre-dispatch checklist gates: FASTag healthy (balance/blacklist), documents green, inspection done | S (each) | R-04 acknowledge each |
| BR-TRP-10 | Route deviation > x km from planned corridor → alert; > y km → escalation call tree | A | n/a |
| BR-TRP-11 | Overloaded vehicle cannot gate-out: gross − tare > payload ⇒ hard stop at weighbridge | H | R-02 + safety officer dual (rare legal exceptions e.g. indivisible ODC with permission docs) |
| BR-TRP-12 | Trip cannot close without ePOD (goods) or passenger-confirmation (duty) unless force-closed with reason | H | R-04 force-close, flagged |
| BR-TRP-13 | Force-closed and 48h-silent trips auto-queue to audit review | A | n/a |
| BR-TRP-14 | Detention clock runs from geofence/gate timestamps only (manual detention claims require timestamp evidence) | H | — |
| BR-TRP-15 | Trip costing must post within 24h of close; unposted costs block period close (BP-27) | A/H | R-14 |

### 8.4 Fuel rules (BR-FUEL)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-FUEL-01 | Fuel issue must bind to vehicle + (if in-trip) trip; unbound issues queue as exceptions | H | R-09 |
| BR-FUEL-02 | Fill volume > tank capacity ⇒ exception (fraud signature) | A | n/a |
| BR-FUEL-03 | Card transaction with vehicle GPS > x km from station ⇒ exception (ghost fill) | A | n/a |
| BR-FUEL-04 | Per-trip fuel limit = route norm × tolerance; card limits auto-set per trip where program supports | A/S | R-09 raise per event |
| BR-FUEL-05 | Odd-hour fills (config window) and consecutive fills < y km apart ⇒ exceptions | A | n/a |
| BR-FUEL-06 | Sensor sudden-drop while stationary ⇒ theft alert to R-09 + R-04 (graded by litres) | A | n/a |
| BR-FUEL-07 | km/l below norm − x% for 3 consecutive trips ⇒ inquiry task (vehicle health vs driver) | A | n/a |
| BR-FUEL-08 | Own-station daily dip variance > 0.5% book stock ⇒ investigation task; > 2% ⇒ escalation to R-02 | A/E | n/a |
| BR-FUEL-09 | Bowser issues require geo-stamped issue slip with machine/vehicle ID; unmatched bowser stock blocks bowser re-fill approval | H | R-02 |
| BR-FUEL-10 | Norm changes require AF-12 dual control (norms drive incentives — HR-sensitive) | H | — |

### 8.5 Maintenance rules (BR-MNT)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-MNT-01 | **Maintenance lock:** PM overdue beyond grace (default 15% of interval) ⇒ vehicle blocked from allocation | H | R-02 via AF-05, per event, with next-slot commitment |
| BR-MNT-02 | Vehicle under open job card (state InWorkshop) cannot be allocated (brief's rule; subsumed by BR-VEH-01 but listed for traceability) | H | R-02 |
| BR-MNT-03 | Job card cannot close without QC sign-off + (repair jobs) road test record | H | R-06 documented skip (minor jobs list) |
| BR-MNT-04 | Estimate above threshold requires approval before work begins (AF-05); emergency-repair lane allows start with 24h retro-approval | H/E | per AF-05 |
| BR-MNT-05 | Repeat repair (same system, same vehicle, ≤30 days) auto-flags original job for quality review | A | n/a |
| BR-MNT-06 | No parts issue without an open job card reference | H | — |
| BR-MNT-07 | Warranty-eligible work must route to claim before consuming paid inventory (system checks part/vehicle warranty windows) | A/S | R-06 |
| BR-MNT-08 | Safety-critical defects (brakes, steering, tyres below tread floor) reported from inspection ⇒ immediate allocation block until cleared | H | — |
| BR-MNT-09 | DTC codes on critical list auto-open defect job cards (R-07 config) | A | n/a |
| BR-MNT-10 | Statutory maintenance events (speed-governor calibration, tanker test) are compliance documents — expiry follows BR-CMP rules | H | — |
| BR-MNT-11 | Mechanic task actual-time > 2× standard time triggers review flag (not punishment — data hygiene) | A | n/a |
| BR-MNT-12 | Cannibalization requires inter-vehicle transfer record naming both vehicles + parts | H | — |

### 8.6 Compliance rules (BR-CMP)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-CMP-01 | Blocking document set (default: insurance, fitness, permit, tax; configurable to add PUC) expired ⇒ vehicle → ComplianceHold automatically | H (A) | AF-09 only |
| BR-CMP-02 | Expiry warnings: T−30 amber, T−15 orange + renewal task, T−7 red + daily digest to R-02 (brief's insurance/permit/license expiry rules generalized) | A | n/a |
| BR-CMP-03 | Dependency gating: renewal workflows verify prerequisite documents first (fitness ⇐ AIS-140 active + tax + insurance — P1 Finding 3) | H | — |
| BR-CMP-04 | Document uploads require machine-read validity dates + human verification for activation; unverified documents don't clear holds | H | R-21 |
| BR-CMP-05 | As-on-date document snapshot is sealed automatically on any accident/incident (MACT/insurer defense) | A | n/a |
| BR-CMP-06 | Driver credential set (DL, badge, medical, hazmat) follows same T−30/15/7 + hold mechanics | A/H | per BR-DRV-02 |
| BR-CMP-07 | Challans auto-bind to vehicle+probable driver; unresolved challans > aging threshold escalate; challan patterns (same corridor/type) feed route/driver actions | A | n/a |
| BR-CMP-08 | Vehicles in restricted-age geographies (NCR EOL rules) auto-flag N months before cutoff into disposal pipeline | A | n/a |
| BR-CMP-09 | Vendor-vehicle documents held to the same engine; vendor placement blocked for red vehicles (BP-18 pre-gate check) | H | R-02 |
| BR-CMP-10 | Rule-pack changes (validity periods, blocking sets) carry effective dates; historical evaluations use period-correct rules (audit defensibility) | H (A) | — |
| BR-CMP-11 | Statutory registers (log book, gate, duty-hour, DGMS set) are generated artifacts — hand-editing prohibited; corrections via source-record amendment | H | — |
| BR-CMP-12 | AIS-140 device removal/tamper signal ⇒ compliance alert (fitness-renewal dependency + legal exposure) | A | n/a |
| BR-CMP-13 | Permit annual-authorization & composite-fee sub-renewals tracked as first-class expiries (the 5-year-headline trap — P1 B.13) | A | n/a |
| BR-CMP-14 | Insurance endorsement lag: vehicles added to fleet policy must show endorsement evidence within x days or flag uninsured-risk | A/E | R-14 |
| BR-CMP-15 | PUC state-profile config: validity 6/12 months per vehicle emission class & state practice (P1 I.1 [C]) | A | n/a |

### 8.7 Vendor rules (BR-VND)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-VND-01 | No indent without an active contract + rate card (spot lane exception via BP-20 with its own caps) | H | R-02 |
| BR-VND-02 | Rate-card activation requires dual approval (AF-06); rate changes never retroactive without R-14 sign-off | H | — |
| BR-VND-03 | Diesel-escalation recomputation uses trip-date index price automatically; manual escalation entry prohibited | H (A) | — |
| BR-VND-04 | Indent acceptance deadline; silence = auto-decline + cascade + scorecard event | A | n/a |
| BR-VND-05 | Vendor bills auto-verify against system trips; bills referencing non-system trips cannot auto-pass (hard queue) | H | R-12 (investigated) |
| BR-VND-06 | Deviation tolerance ±0.5% or ₹500/bill (config); above → workbench; auto-pass logged with computation snapshot | A | n/a |
| BR-VND-07 | Penalties/debit notes require evidence links (timestamps, ePOD exceptions, photos) — no free-hand debits | H | R-14 |
| BR-VND-08 | Scorecard → business-share allocation runs on published policy weights; manual share overrides logged with reason (favoritism visibility) | A/S | R-02 |
| BR-VND-09 | Vendor concentration cap: no vendor > x% of lane/site spend without R-02 acknowledgment (continuity risk) | S/E | R-02 |
| BR-VND-10 | Security deposit / advance exposure caps per vendor grade; new vendors capped until probation review | H | R-14 |
| BR-VND-11 | Substituted vehicles/drivers on placements re-verify before gate (no "same as approved" assumption) | H | — |
| BR-VND-12 | Blacklisted vendor (any group entity) blocked from empanelment & indents; blacklist requires dual sign-off + reason | H | R-02+R-12 dual |

### 8.8 ETS & passenger rules (BR-ETS)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-ETS-01 | Bookings validate against entitlement matrix (grade × service class × time window) | H | Dept head via AF-02 |
| BR-ETS-02 | Roster changes after cutoff enter the exception lane (cost-coded to requesting department) | S | R-22 |
| BR-ETS-03 | **No woman employee is first pickup or last drop without an escort/guard on board** (config per company policy; default on for night windows) — routing engine constraint, not advisory | H | — |
| BR-ETS-04 | Safe-drop OTP confirmation required per drop; unconfirmed drops keep the trip open on the live board + escalation timer | H (A) | R-22 (with call-verification note) |
| BR-ETS-05 | Driver & vehicle on ETS routes must hold police verification + PSV badge + contract-carriage permit validity | H | — |
| BR-ETS-06 | No-show marking allowed only after wait-timer at geofenced pickup point (protects employees from false no-shows) | H (A) | n/a |
| BR-ETS-07 | Ad-hoc night bookings auto-apply safety rules (escort, tracked-share to emergency contact where consented) | A | n/a |
| BR-ETS-08 | Route ride-time per employee ≤ policy max (default 90 min); routing engine hard constraint | H | R-22 (employee-consented) |
| BR-ETS-09 | Vendor billing uses GPS-verified km only; vendor-claimed km without GPS requires R-12 adjudication | H | per AF-07 |
| BR-ETS-10 | SOS events trigger the full protocol (control room + security + emergency contact + location stream) and cannot be dismissed without incident record | H (A) | — |

### 8.9 Financial rules (BR-FIN)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-FIN-01 | Every cost event carries vehicle + cost center + period tags at entry (P1 P8); untagged entries cannot post | H | — |
| BR-FIN-02 | No self-approval anywhere; approver ≠ requester/creator enforced structurally (§5.3) | H | — |
| BR-FIN-03 | Approval = budget commitment; commitments + actuals > budget head ⇒ AF-11 exception before further approvals | H | R-14 |
| BR-FIN-04 | GST/GTA treatment (RCM/FCM, rate) derives from contract configuration; manual tax edits prohibited on transactions | H (A) | R-14 (correction workflow) |
| BR-FIN-05 | TDS auto-computed on freight payments per configured sections | A | R-14 |
| BR-FIN-06 | Driver advance cap per trip type; new advance blocked if khata debit > cap or > y days old | H | R-02 |
| BR-FIN-07 | Payment runs require maker-checker (R-15 prepares, R-14 releases); vendor bank-detail changes trigger re-verification + cooling period | H | — |
| BR-FIN-08 | Period close locks transactions; post-close corrections via next-period adjustment entries only | H | R-14 (dual with R-02) |
| BR-FIN-09 | Personal-use recovery auto-computed from flagged duties at configured ₹/km → payroll interface | A | R-14 |
| BR-FIN-10 | Disposal proceeds, insurance settlements, scrap/core credits must land against the vehicle ledger (leakage catch) | H | — |

### 8.10 Gate, data & security rules (BR-GTE / BR-SEC)

| ID | Rule | Enf. | Override |
|---|---|---|---|
| BR-GTE-01 | No gate-out for red-verdict vehicles (document/overload/EWB failures); override happens remotely via AF-09, never at the gate | H | AF-09 |
| BR-GTE-02 | Gate timestamps are system-generated at event capture; manual timestamp edits prohibited (they are detention money — P1 A.1) | H | — |
| BR-GTE-03 | Expected-vehicle pre-authorization list is the default admission path; walk-ins require R-04 confirmation | S | R-16→R-04 |
| BR-GTE-04 | Weighbridge captures bind automatically to open trip at the bridge; manual weight entry is flagged and photo-backed | S | R-24 |
| BR-SEC-01 | No hard deletes on transactional data; soft-delete with actor+reason; audit log immutable & tamper-evident | H | — |
| BR-SEC-02 | Location visibility is role-scoped; driver off-duty location masked per policy (P1 D.9); ETS employee addresses encrypted, need-to-know | H | — |
| BR-SEC-03 | Personal-sensitive data (DPDP class) access requires explicit grant + purpose; exports of this class watermarked + logged | H | — |
| BR-SEC-04 | All overrides, permission changes, rate changes, and master edits generate audit events visible to R-20 (no exceptions) | H (A) | — |
| BR-SEC-05 | Break-glass access: dual-authorized, 4h expiry, next-morning review task auto-created (§5.3) | H (A) | — |
| BR-SEC-06 | Data retention per class (telemetry hot/warm/cold per P1 B.19; financial 8y; personal per DPDP) — configurable within legal floors | A | R-01+R-14 |

*Catalog count: 124 rules. Traceability to the brief's named rules: under-maintenance block = BR-MNT-01/02 · license expiry = BR-DRV-02 · insurance/permit expiry = BR-CMP-01/02 · overload = BR-VEH-04 + BR-TRP-11 · max hours = BR-DRV-04 · rest = BR-DRV-05 · fuel limit = BR-FUEL-04 · duplicate trips = BR-TRP-02 · trip/driver/vehicle overlap = BR-TRP-03/04, BR-DRV-03, BR-VEH-02 · maintenance lock = BR-MNT-01.*

---

## 9. KPI Dictionary

Grain = lowest meaningful computation level. Targets are defaults for customer goal-setting (G-linked); benchmarks from P1 research where available. Every KPI below must be computable from data the processes in §6 already capture — no KPI may demand new manual entry (design law).

### 9.1 Fleet & asset

| ID | KPI | Formula | Grain | Owner | Target/benchmark |
|---|---|---|---|---|---|
| KPI-01 | Fleet availability % | (fleet-days − down-days) ÷ fleet-days | vehicle/day | R-03 | ≥90% |
| KPI-02 | Deployment % | days with ≥1 trip ÷ available days | vehicle/day | R-04 | ≥75–85% |
| KPI-03 | Distance utilization | actual km ÷ benchmark km | vehicle/month | R-02 | model-specific (long-haul 8–10K km/mo) |
| KPI-04 | Capacity utilization % | actual load ÷ rated capacity (wt & vol) | trip | R-04 | ≥80% wt |
| KPI-05 | Loaded-km ratio | loaded km ÷ total km | vehicle/month | R-02 | ≥65–70% (deadhead <30–35%) |
| KPI-06 | Idle hours | ignition-off at non-home geofence + no assignment | vehicle/day | R-04 | trend ↓ |
| KPI-07 | Utilization spread | σ of deployment % across sites | site/month | R-02 | ↓ (redeployment signal) |
| KPI-08 | Downtime hours per job | workshop in→out per job card | job | R-06 | model/job-type norms |
| KPI-09 | TCO / lifecycle cost per km | full-stack cost ÷ lifetime km | vehicle | R-14 | segment benchmarks |
| KPI-10 | Disposal realization % | sale proceeds ÷ book value | event | R-14 | ≥100% book |

### 9.2 Trips & service

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-11 | On-time dispatch % | dispatched ≤ planned window ÷ total | trip | R-04 | ≥95% |
| KPI-12 | OTIF | on-time & in-full deliveries ÷ total | trip/customer | R-02 | ≥95% |
| KPI-13 | Placement compliance % | vendor placements on time ÷ confirmed indents | vendor/lane | R-12 | ≥92% |
| KPI-14 | Trip cycle time | dispatch → close | lane | R-04 | lane norms |
| KPI-15 | Planned-vs-actual km variance | (actual − planned) ÷ planned | trip | R-04 | ±5% |
| KPI-16 | POD cycle time | delivery → verified POD | trip | R-05 | ≤24h (G7) |
| KPI-17 | Detention hours & ₹ | beyond free-time per contract clocks | trip/customer/vendor | R-12 | ↓; recovery ≥ billed |
| KPI-18 | Exception closure time | exception open → resolved | event | R-04 | ≤SLA per type |
| KPI-19 | Request approval TAT | request → final approval | request type | R-18 | ≤AF SLA |
| KPI-20 | Loading/gate TAT | gate-in → gate-out | site/day | R-16 | site norms (mfg <6–8h) |

### 9.3 Fuel & toll

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-21 | Fleet fuel efficiency | km ÷ litres (or l/hr machinery) | vehicle/route/driver | R-09 | model-route norms |
| KPI-22 | Fuel cost per km | fuel ₹ ÷ km | vehicle/month | R-09 | trend + norm |
| KPI-23 | Norm adherence % | trips within norm tolerance ÷ trips | driver/vehicle | R-09 | ≥90% |
| KPI-24 | Fuel exceptions per 1,000 txns | typed exceptions ÷ txns | site/month | R-09 | ↓; closure ≤48h |
| KPI-25 | Confirmed leakage recovered ₹ | recoveries from fuel catches | site/month | R-02 | G1a evidence |
| KPI-26 | Station stock variance % | (book − physical) ÷ book | station/day | R-09 | ≤0.5% |
| KPI-27 | % spend on-card | card ₹ ÷ total fuel ₹ | site/month | R-09 | ≥90% |
| KPI-28 | Toll reconciliation match % | debits auto-matched to trips ÷ debits | month | R-15 | ≥97% |
| KPI-29 | Disputed toll recovered ₹ | double-deduction/phantom refunds | month | R-15 | 100% of filed |

### 9.4 Maintenance, tyres, parts

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-30 | PM compliance % | PM done ≤ due ÷ PM due | site/month | R-03 | ≥95% (P1 F.2) |
| KPI-31 | Breakdowns per lakh km | events ÷ (km/100,000) | fleet/month | R-07 | ↓40–60% yr-1 |
| KPI-32 | MTTR / MTBF | standard | system/model | R-07 | trend |
| KPI-33 | First-time-fix % | jobs without 30-day repeat ÷ jobs | workshop | R-06 | ≥85% |
| KPI-34 | Maintenance ₹/km | maintenance cost ÷ km | vehicle/month | R-03 | segment norms (G1c) |
| KPI-35 | Estimate accuracy | |actual − estimate| ÷ estimate | job | R-06 | ≤10% |
| KPI-36 | Waiting-parts hours | job time in WaitingParts | workshop/month | R-23 | ↓ |
| KPI-37 | Stock-out vehicle-down incidents | downtime events caused by parts | store/month | R-23 | →0 |
| KPI-38 | Inventory turns | consumption ÷ avg stock | store/quarter | R-23 | ≥4–6 |
| KPI-39 | Tyre cost per km | (new + retreads) ÷ casing lifetime km | brand/pattern/position | R-03 | league ↓ |
| KPI-40 | Retread ratio | retreads ÷ new purchases | fleet/quarter | R-03 | ≥1.0 well-run |
| KPI-41 | Warranty recovered ₹ | claims credited (parts/tyres/batteries) | fleet/quarter | R-07 | ↑ (usually ≈0 today) |

### 9.5 Compliance & safety

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-42 | Compliance coverage % | vehicles all-green ÷ fleet, daily snapshot | site/day | R-21 | 100% (G2) |
| KPI-43 | Expired-document vehicle-days | Σ days operated on any red doc | fleet/month | R-21 | 0 |
| KPI-44 | Renewal on-time % | renewals closed ≤ expiry ÷ due | doc type | R-21 | 100% |
| KPI-45 | Challan aging | open challans > threshold days | fleet | R-21 | →0 |
| KPI-46 | Accidents per million km | incidents ÷ (km/1,000,000) | fleet/quarter | R-02 | ↓20–40% (G6) |
| KPI-47 | Claim cycle days | intimation → settlement | claim | R-03 | ≤45d |
| KPI-48 | Duty-hour violations | assignments/duties breaching pack rules | site/month | R-13 | →0 |
| KPI-49 | Safe-drop compliance % | OTP-confirmed drops ÷ drops (ETS) | day | R-22 | 100% |
| KPI-50 | Override rate & aging | AF-09-class overrides; open review items | month | R-20 | ↓; reviews ≤7d |

### 9.6 Driver & vendor

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-51 | Driver safety score | weighted telematics events per 100 km (composite: harsh events, overspeed, night, fatigue-window) | driver/month | R-13 | fleet median ↑ |
| KPI-52 | Driver retention % | 1 − separations ÷ avg headcount (annualized) | fleet/quarter | R-13 | ≥70% (baseline 50–70%) |
| KPI-53 | Settlement dispute rate | disputed line items ÷ settlements | month | R-05 | ≤5% and ↓ (F.6) |
| KPI-54 | Settlement TAT | trip close → disbursal | driver/month | R-15 | ≤72h |
| KPI-55 | Vendor scorecard composite | weighted: placement, on-time, docs, damage, bill accuracy | vendor/month | R-12 | published policy |
| KPI-56 | Bill first-pass % | bills auto-passing ÷ submitted | vendor/month | R-12 | ≥85% |
| KPI-57 | Vendor settlement cycle | ePOD-verified bill → payment | vendor/month | R-14 | per contract (7–30d) |
| KPI-58 | Leakage caught ₹ | deviation adjustments sustained | month | R-12 | G1b evidence |

### 9.7 Financial & adoption

| ID | KPI | Formula | Grain | Owner | Target |
|---|---|---|---|---|---|
| KPI-59 | Cost per km (per tonne-km / per employee-trip / per hour) | full stack per P1 B.34 | vehicle/route/CC/month | R-14 | G1: −8–15% yr-1 |
| KPI-60 | Budget variance % | (actual+commit − budget) ÷ budget | head/CC/month | R-14 | ±5% |
| KPI-61 | Cost traceability % | cost events with full lineage ÷ all | month | R-14 | ≥98% (G3) |
| KPI-62 | Working-capital cycle | POD→invoice→collection days | customer/month | R-14 | −30–50% (G7) |
| KPI-63 | Born-digital transaction % | transactions created in-system ÷ total (vs retro entry) | site/month | R-01 | ≥80% by month 6 (G9) |
| KPI-64 | Module adoption (DAU/eligible users) | active users ÷ provisioned per role | module/week | R-01 | ≥70% |
| KPI-65 | Alert precision % | alerts actioned-or-confirmed ÷ alerts fired | alert type/month | R-01 | ≥80% (P1 D.11 — the product measures itself) |

## 10. Pain Point → Requirement Traceability

Priorities: **M**ust (v1) / **S**hould (v1 if capacity) / **C**ould (Phase 2 of roadmap) / **W**on't (this generation) — final MoSCoW ratified in Phase 6. Sources: P1 sections cited.

| PP | Pain (source) | Requirement | Module(s) | Pri |
|---|---|---|---|---|
| PP-01 | Indents/placements on WhatsApp; zero accountability (A.1, A.4) | REQ-01 Indent→placement workflow with vendor portal + WhatsApp-bridge actionable links, silence-cascade, scorecard events | Vendor, Dispatch | M |
| PP-02 | Freight bills verified manually in Excel; 2–5% leakage (A.1, A.4, G.5) | REQ-02 Rate-card engine (incl. diesel escalation) with 3-way auto-verification and deviation workbench | Contracts, Invoices | M |
| PP-03 | Fuel leaks across 4 unreconciled sources (B.8) | REQ-03 Unified fuel ledger + reconciliation square + typed exception queue + station/bowser stock module | Fuel | M |
| PP-04 | Renewal surprises; expiry discovered at checkpoints (B.12–16) | REQ-04 Compliance engine: dependency graph, T−30 workflows, auto-holds, VAHAN cross-checks | Compliance | M |
| PP-05 | Vendor payment black hole breeds vendor apathy (R-11) | REQ-05 Vendor portal with bill status transparency + fast-lane payment for auto-verified bills | Vendor, Payments | M |
| PP-06 | Settlement opacity drives driver churn (B.7, F.6) | REQ-06 Driver khata with in-app vernacular statement, dispute lane, ≤72h disbursal | Drivers, Payments | M |
| PP-07 | Double allocation / overlap chaos (B.5) | REQ-07 Availability computation + DB-level overlap constraints (BR-VEH-02, BR-DRV-03) | Dispatch | M |
| PP-08 | PM postponed forever; breakdown firefighting (B.9) | REQ-08 Multi-trigger PM engine + maintenance lock + recorded dispatch-workshop arbitration | Maintenance | M |
| PP-09 | Workshop opacity: waiting-parts blame, repeat repairs (B.37) | REQ-09 Job-card lifecycle with state-level time tracking + parts hard-link + quality flags | Workshop, Inventory | M |
| PP-10 | "Real-time" tracking that lags minutes; silent devices (B.19, G.5) | REQ-10 ≤10s-capable ingestion, device-health console, honest ping-age display, degradation ladder for non-owned vehicles | GPS | M |
| PP-11 | Detention money lost to timestamp fights (A.1, B.30) | REQ-11 Geofence/gate-sealed detention clocks + evidence-linked billing | Gate, Trips, Invoices | M |
| PP-12 | POD chase delays billing 30–60 days (A.4, A.5) | REQ-12 ePOD (hybrid modes) + exception typing + auto invoice-release triggers | Trips, Billing | M |
| PP-13 | Approvals on WhatsApp; audit anxiety (A.7, B.27) | REQ-13 Approval engine per AF catalog: SLAs, delegation, regularization lane, full trail | Approvals | M |
| PP-14 | ETS: nightly manual routing; safety compliance unprovable (A.9) | REQ-14 Roster ingestion + constraint-based auto-routing (minutes) + escort logic + OTP safe-drop chain with auditable log | ETS | M |
| PP-15 | Toll double-deductions; FASTag blacklists at the worst moment (B.17–18) | REQ-15 Tag health pre-dispatch checks + debit-to-trip auto-match + dispute tracker | Toll/FASTag | M |
| PP-16 | Cost/km unknown or fuel-only; fleet decisions by gut (B.33–34) | REQ-16 Full-stack costing engine + per-vehicle P&L + right-sizing pack | Analytics, Finance | M |
| PP-17 | Tyres untracked; #2 cost invisible (B.38) | REQ-17 Per-tyre serialized lifecycle with CPK analytics + gate serial audit hooks | Tyres | S |
| PP-18 | Government: paper log books, condemnation years, CAG findings (A.7) | REQ-18 Digital log book + duty slips + condemnation workflow + statutory register exports | Requests, Approvals, Reports | S (M for govt tier) |
| PP-19 | Alert fatigue from false positives (D.11, G.5) | REQ-19 Alert policy engine (per-site tuning, severity channels, suppression learning) + KPI-65 self-measurement | Notifications | M |
| PP-20 | Excel migration cliff kills adoption (D.7, G.5) | REQ-20 Import wizard suite (templated, validating, forgiving) + progressive data enrichment + parallel-run comfort | Admin/Migration | M |
| PP-21 | Per-seat pricing forces account sharing (G.2.9) | REQ-21 Unlimited operational users per vehicle-based license (commercial requirement) | Commercial | M |
| PP-22 | Incumbent contract abuse resentment (G.5) | REQ-22 Monthly-terminable terms, pro-rata downsizing, published exit policy — contract as feature | Commercial | M |
| PP-23 | Mixed fleets (km+hours) unsupported (A.2, A.3) | REQ-23 Dual-meter engine + project/cost-code allocation + shift operations pack | Vehicles, Projects | S |
| PP-24 | Spot hire is a diligence black hole (B.22) | REQ-24 Spot-hire lite flow with API verification, rate history, capped exposure | Vendor/Spot | S |
| PP-25 | Weighbridge/gate systems disconnected from freight (A.1, D.6) | REQ-25 Gate console + weighbridge integration + overload hard-stop | Gate pack | S |
| PP-26 | Battery/EV lifecycle invisible (B.39) | REQ-26 Serialized battery registry + warranty engine; EV SoH pack | Battery; EV (roadmap) | C |
| PP-27 | No NL access to fleet data for non-analyst users (G.2 AI race) | REQ-27 AI layer v1: NL query (vernacular), OCR pipelines, fuel/route anomaly models, predictive-maintenance triage | AI | S |
| PP-28 | Multi-state AIS-140/permit patchwork (B.13, I.1) | REQ-28 State-profile configuration layer within India pack | Compliance | M |

## 11. Assumptions, Constraints, Dependencies

**Assumptions.** A1: Customers can supply vehicle/driver/vendor masters in spreadsheet form of variable quality (REQ-20 sized for this). A2: ≥70% of drivers in target fleets carry Android smartphones; the rest are covered by coordinator fallbacks (P1 D.2). A3: Government verification APIs (VAHAN/SARATHI class) remain commercially accessible via aggregators at viable unit costs (P1 I.4). A4: OMC fuel-card programs continue offering statement/API access to fleet customers. A5: Customers accept SaaS for non-government tiers; government tier deferred until residency/certification readiness (D.10). A6: WhatsApp Business API remains viable as a bridge channel at acceptable cost (F.15). A7: Device partners (AIS-140 + OBD vendors) will certify against our ingestion spec in exchange for demand aggregation (P5).

**Constraints.** C1: Compliance parameters must be configuration, never code (D.5) — including state profiles (PP-28). C2: Offline-first mobile for driver/gate/mechanic personas; sync-conflict resolution favors field capture with server-side flags. C3: No feature may *require* the driver app (fallback law). C4: DPDP Act data-class handling from v1 (BR-SEC-02/03); telemetry retention tiers per P1 B.19. C5: Audit immutability (BR-SEC-01/04) is foundational schema design, not a later hardening. C6: Every KPI computable without new manual entry (§9 design law). C7: Vernacular UI floor: Hindi + 2 regional languages for field personas at v1.

**Dependencies.** D1: Aggregator contracts (verification, challan) — commercial lead time. D2: OMC program onboarding per customer — sales-cycle artifact. D3: FASTag issuer statement formats vary by bank — parser library grows with customers. D4: HRMS integrations (ETS roster) — per-customer connector work; standard file spec as fallback. D5: ERP export formats (SAP/Oracle/Tally) — v1 ships file-based + API for Tally/SAP IDoc patterns; deep connectors per Phase 6.

## 12. Open Questions (for product owner decision before/during Phase 3)

| # | Question | Impacts | Default if undecided |
|---|---|---|---|
| OQ-1 | Is ETS a v1 module or fast-follow? (Market pull is strong; scope is a product-within-product — B.24) | Roadmap, team sizing | Fast-follow: v1 ships cab/pool booking; full ETS routing in release 2 |
| OQ-2 | Native lite-procurement for non-ERP customers, or parts-PO only? | Inventory scope | Lite-procurement (contractor segment has no ERP) |
| OQ-3 | Customer-facing portal (consignor/consignee track-&-trace) in v1? | Trips scope | Share-links only in v1; portal in release 2 |
| OQ-4 | Dashcam/video: integrate which partners first? (Build = never, per G.2.5) | GPS module, partnerships | Ingestion spec + 2 partner integrations by release 2 |
| OQ-5 | Payroll execution boundary: we compute components — do we also push to payroll APIs or export files only? | HR interface | Files v1, APIs later |
| OQ-6 | Pricing: is ETS priced per-employee-trip or per-vehicle like the rest? | Commercial model | Per-vehicle default, per-trip option for pure-vendor ETS |
| OQ-7 | On-prem/government tier timing (D.10 certifications are 6–12 month leads) | Phase 6 sequencing | Begin certifications at GA; govt GTM in year 2 |
| OQ-8 | Load-board/backhaul marketplace integrations (B.31) — partner or defer? | Trips roadmap | Defer to roadmap; ship inbound-outbound matching first |

## 13. Sign-off & Next Phase

**Approval checklist for this BRD:** role catalog covers your org variants (§4)? approval thresholds/defaults acceptable (§7)? rule defaults & override doctrine acceptable (§8)? KPI targets align with contracted goals (§2.2/§9)? open questions decided or defaults accepted (§12)?

**Phase 3 (PRD) will deliver, consuming this BRD:** complete module catalog (~24 modules incl. Dashboard, Vehicles, Drivers, Trips, Requests, Cab/ETS, Dispatch, Routes, GPS/Live, Maintenance, Workshop, Fuel, Tyres, Battery, Inventory, Vendors, Contracts, Invoices/Payments, Compliance suite, Toll/FASTag, Documents, Incidents, Notifications, Approvals, Reports/Analytics, Audit, Admin/RBAC, Settings, Integrations) — each with purpose, features, user stories with acceptance criteria, business rules binding (BR-xx references), validations, edge cases, permissions (§5 binding), dependencies, reports, notifications, APIs (business-level), and data requirements; plus workflow diagrams (Mermaid), notification matrix, dashboard specs per role, and the AI feature set (REQ-27 expansion).

*— End of Phase 2 —*






