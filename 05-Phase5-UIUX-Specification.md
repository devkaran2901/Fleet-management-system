# Enterprise Fleet Management System (FMS)
## Phase 5 — UI/UX Specification

| Document Control | |
|---|---|
| Document | Phase 5 of 6 — UI/UX Spec · v1.0 · 13 Jul 2026 · For review |
| Upstream | P2 roles (R-xx), P3 modules (M-xx/P-xx) & dashboards (§9), P4 API surface |
| Screen format | **Purpose · Layout · Components · Actions · Filters/Search · States · Notes.** Every list screen inherits §6.1 table pattern; every form inherits §6.2 — only deviations are documented. |

---

## 1. Design Principles (binding)

1. **Exceptions before data** — every workspace opens on "what needs me now," not a grid (P1 F.7).
2. **Named-rule transparency** — every block/warning shows the rule ID + plain-language reason + who can override (BR catalog surfaced, never mystery greys).
3. **Progressive disclosure by role** — dispatcher power-density; driver one-action-at-a-time; Geotab's depth without Geotab's burial (P1 G.5).
4. **≤30-second field interactions** — driver/mechanic/gate tasks complete in ≤3 taps + camera (P2 R-08 hard constraint).
5. **Honest data display** — ping-age on every marker, confidence tags on AI output, "unverified" badges on unchecked documents.
6. **Evidence at point of decision** — approvals/exceptions render context inline (cost, budget, photos, map) — no tab-hunting (P2 R-18 ≤30s rule).
7. **Vernacular + icon-first field UI** — EN/HI + 2 regional; icons carry meaning, text confirms (P1 D.2).
8. **Offline is a state, not an error** — queued badge, sync status, never a dead end.
9. **WhatsApp is a surface** — share/act links render well in chat; deep-link back into apps (P1 F.15).
10. **Keyboard-first ops web** — dispatchers live on keys: global `⌘K` command palette, `A` assign, `/` search, arrow-navigation on boards.

## 2. Design System Foundations

**Tokens:** 8-pt spacing grid; radius 8/12; elevation 3 tiers. **Type:** Inter (Latin) + Noto Sans Devanagari/regional; scale 12/14/16/20/24/32; tabular numerals for all metrics. **Color:** neutral slate base; semantic: green=compliant/success, amber=T−30/warning, orange=T−15, red=blocked/expired/SOS, blue=info/in-progress, purple=AI; **status colors never the only signal** (icon + label always — a11y). Data-viz palette 8-step, colorblind-safe. **Dark mode:** token-swapped (true dark `#0B0E14` surfaces), default for control-room wallboards and driver night hours (auto by sunset); charts re-tokened, no pure-white text. **Density modes:** comfortable (default) / compact (ops) — user toggle, per-table override. **Iconography:** single 24px line set; domain icons (truck classes, tyre, bowser, FASTag, weighbridge) custom-drawn — no generic clipart. **Motion:** 150–250ms ease; live-map markers interpolate between pings (no teleporting); reduced-motion respected.

## 3. Information Architecture & Navigation

**Web shell:** left rail (collapsible, module icons grouped: Operate / Maintain / Commercial / Comply / Analyze / Admin — licensing hides unowned), top bar (org-scope switcher group→site, global search `⌘K`, create `+`, alerts bell with severity dots, approvals inbox badge, user/lang/theme), content canvas, right slide-over panel for record detail/peek (list never loses position). **Breadcrumbs** on all non-dashboard pages. **Record 360° pattern:** header (identity + state chip + primary actions) → tab strip (Overview / linked-object tabs / History / Documents / Audit).

**Page hierarchy (web):**
```
Home(role dashboard)
├─ Operate: Dispatch Board · Live Map · Trips · Requests · Duties/Roster · Gate Queue
├─ Maintain: Workshop Board · PM Planner · Job Cards · Parts · Tyres · Batteries
├─ Commercial: Vendors · Indents · Contracts/Rates · Bills · Invoices · Khata/Settlements · Toll
├─ Comply: Compliance Center · Renewals · Challans · Insurance/Claims · Incidents · Registers
├─ Fleet: Vehicles · Drivers · Fuel Control · Devices · Idle Board
├─ Analyze: KPI Explorer · Reports · Costing/P&L · Right-sizing · Board Pack
└─ Admin: Org/Users/Roles · Rule Packs · Approval Flows · Notification Policies · Integrations · Imports · Audit
```
**Mobile apps** are role-scoped launchers (driver/vendor/employee/mechanic/manager-lite) — never the web IA squeezed small.

## 4. Web Screen Catalog

### 4.1 Operate

**S-01 Role Dashboard.** Purpose: P3 §9 layouts. Layout: 12-col responsive grid, 3 widget rows. Components: KPI tiles (value+delta+spark), queue cards (top-5 + count chip), heatmap (compliance), mini-map. Actions: tile-drill, layout edit (add/move widgets), date-scope. States: skeleton loaders; empty="all clear" illustration. Notes: loads ≤2s (NFR); wallboard mode = auto-rotate + dark.

**S-02 Dispatch Board** *(flagship — highest design investment).* Purpose: BP-05. Layout: 3-zone — left **Demand lane** (approved requests/loads, grouped by window, urgency-sorted), center **Assignment canvas** (timeline Gantt: rows=vehicles, blocks=trips; conflict shading live), right **Context panel** (selected load/vehicle detail, eligibility list ranked with grey+rule-id for ineligible). Components: drag-drop assignment, capacity gauges per vehicle, vendor-spill button per unfilled load, pre-dispatch checklist chips (docs/FASTag/inspection — click to see), publish bar (n assigned / m pending). Actions: assign (drag or `A`), swap, split, defer, spill-to-vendor, publish, mass re-plan (filter→select→shift). Filters: site, vehicle class, customer, window, status. Search: load/LR/vehicle/driver. States: conflict=red block + toast w/ BR id; concurrent-edit = live presence avatars + optimistic-lock toasts. Notes: keyboard complete; 200-movement day must feel fluid (virtualized rows).

**S-03 Live Map.** Purpose: M-07 control. Layout: full-bleed map + left vehicle list (virtualized, status-filtered) + bottom alert ticker. Components: clustered markers (state-colored, ping-age badge), geofence overlays, corridor overlays, follow-mode, trip-trail on select. Actions: track-share link, message driver, create geofence, open trip. Filters: status/class/site/alert-type; saved views. States: stale (>2 min) markers desaturate + age label (honesty rule). Notes: 5K markers NFR; dark default in control rooms.

**S-04 Trips list + S-05 Trip 360°.** S-04: table (state chips, lane, vehicle/driver, window, POD status, cost-to-date); bulk: export, assign follow-up. S-05 tabs: Overview (timeline of milestones w/ map strip), Load & Docs (LR, EWB w/ validity countdown, invoices), Expenses (khata-linked), POD (viewer + exception panel), Costing (rate snapshot per BR-VND-06), History/Audit. Actions: state verbs gated by role (dispatch, transship wizard, force-close w/ reason modal). Notes: transship wizard = 3 steps (pick rescue vehicle → docs relink checklist → confirm EWB update).

**S-06 Requests.** Requester form (3 fields + smart defaults + entitlement hint inline; expands only on "advanced") → status tracker (stepper: submitted→approved→assigned→done w/ ETA). Coordinator queue view: intake grid + complete-and-route slide-over. Notes: template gallery ("every Tuesday plant→depot").

**S-07 Duties & Roster.** Week grid (drivers × days), legal-violation cells red w/ rule id (publish blocked), drag to assign, substitution cascade modal (ranked spare list), acknowledge status per driver. Filters: depot, license class, leave overlay.

**S-08 Gate Queue (web view of M-24).** Expected list w/ ETA, at-gate now (verdict chips), history. Action: remote-clear red (AF-09 modal — reason, notify banner).

### 4.2 Maintain

**S-09 Workshop Board.** Kanban by job-card state (incl. explicit **Waiting-Parts** column w/ aging chips), bay swim-lane toggle, mechanic load bar. Card: vehicle, symptom, down-hours counter (₹ impact tooltip), estimate state. Actions: new job card (from due-list/defect/DTC), assign bay/mechanic, escalate. 

**S-10 Job Card 360°.** Tabs: Tasks (checklist w/ clock state per mechanic), Estimate (line builder: parts autocomplete from M-14 stock w/ availability chip, labour std-time autofill; approval stepper), Parts (issues/returns/serials), Outside work (PO chips), QC/Road-test (sign-off gate), Costs, History. Notes: estimate approval renders context inline (vehicle history, repeat-repair flag).

**S-11 PM Planner.** Calendar/Gantt of due items vs dispatch commitments; drag to slot (creates the recorded arbitration); overdue ladder visual (amber→lock icon); bulk-schedule idle vehicles. 

**S-12 Parts Store.** Stock grid (min/max bars, ABC/VED chips), part 360° (xrefs, fitment, movement ledger), GRN wizard (PO match, photo QC), issue counter (job-card scan first — hard gate), count sheets (blind-count mode). 

**S-13 Tyres.** Vehicle diagram view (axle map w/ per-position tyre chips: serial, tread gauge, pressure) + tyre 360° (life timeline across vehicles/retreads, CPK). Actions: fit/rotate (drag between positions), inspect (mobile-first), send-to-retread, claim wizard. **S-14 Batteries:** registry + warranty countdown + claim wizard (pro-rata math shown).

### 4.3 Commercial

**S-15 Vendor 360°.** Header: score gauge + share trend. Tabs: Profile/KYC, Fleet (their vehicles w/ doc status chips), Contracts & rates, Indent history, Bills, Scorecard (weights visible), Notes/flags. **S-16 Indent Console:** issued list w/ acceptance countdown, cascade viz (v1→v2→spot), placement tracker (offered vehicle doc-verdict inline). **S-17 Rate-Card Studio:** lane matrix editor (grid), model picker (per-km/trip/tonne/shift/fixed+km/seat), escalation formula builder (index, base date, pass-through % — live preview: "trip on 12 Jul = ₹14,382"), version diff view, dual-approve banner. **S-18 Bill Workbench:** queue split auto-passed / deviations / unknown-trip (hard); deviation row expands to computation diff (expected formula tree vs billed) + evidence links; actions approve/adjust/reject w/ codes. **S-19 Invoices:** POD-gated release queue, annexure preview (per-trip schedule), dispute tracker. **S-20 Khata & Settlements:** driver ledger view (running balance graph), settlement statement builder (auto), dispute lane (line-item thread w/ evidence), disbursal batch screen (maker-checker two-pane). **S-21 Toll Console:** debit-match timeline (GPS path w/ plaza pins vs debits), exception queue (double/phantom/class), dispute pack generator, tag health board.

### 4.4 Comply & Fleet

**S-22 Compliance Center.** Top: zero-expiry tile + heatmap (vehicles × doc types, green/amber/orange/red cells — click = renewal task). Left: expiry forecast list 30/60/90. Right: holds active (w/ AF-09 override log). Notes: the sales-demo screen; must render 1K vehicles instantly.

**S-23 Renewal Task 360°:** stepper per doc type (fitness shows dependency checklist first — AIS-140/tax/insurance chips), fee split fields, upload+OCR verify pane (extracted fields vs typed, confidence-highlighted), ATS appointment picker. **S-24 Challan Workbench:** list w/ evidence (photo/location from issuer), attribution toggle (company/driver w/ policy hint), contest/pay actions, aging chart. **S-25 Insurance & Claims:** policy schedule grid (endorsement lag flags), claim 360° (milestone stepper w/ SLA timers, surveyor-gate lock icon on repairs). **S-26 Incident 360°:** four-track tabs (Emergency checklist w/ big buttons, Legal w/ sealed-snapshot viewer, Insurance, Internal RCA); header shows telematics 60s strip + dashcam clip player. **S-27 Vehicle 360°:** header (regn plate styled, state chip, meters live); tabs Overview (health, next PM, docs strip, utilization spark), Documents, Trips, Costs/P&L, Maintenance, Tyres, Devices, History. **S-28 Driver 360°:** credentials strip w/ expiry chips, eligibility matrix, duty-hour dial (today/week vs caps), khata summary, score trend, incidents. **S-29 Fuel Control Tower:** stock cards per station/bowser (variance sparkline), exception queue (type-iconed, evidence slide-over: map + txn + sensor graph), norm manager (model×route grid), km/l league. **S-30 Device Health:** ping-age histogram, silent list w/ vehicle impact ("blind: 3 in-trip"), tamper alerts.

### 4.5 Analyze & Admin

**S-31 KPI Explorer:** KPI picker (catalog §P2-9) → grain/range → chart+table → drill to records; save as widget/report. **S-32 Costing/P&L:** vehicle P&L statements, cost/km league (sortable, outlier flags), CC recharge journal preview, close-blockers checklist. **S-33 Right-sizing Pack:** generated narrative + scenario sliders (dispose/redeploy/hire-convert → projected ₹). **S-34 Report Center:** catalog w/ schedule chips, run history, statutory register exports (format-locked). **S-35 Admin suite:** org tree editor, role builder (capability×scope matrix w/ segregation validator inline), rule-pack editor (versioned, effective-date, simulate button), approval-flow designer (visual chain w/ threshold nodes), notification policy matrix, integration hub (connector cards w/ health), import wizard (upload→map→validate→preview errors→commit), audit explorer (lineage viewer: pick any payment → walk back to request).

---
## 5. Mobile Surfaces

Shared mobile principles: bottom-tab ≤4 items; one primary action per screen; camera-first capture; offline queue badge in header; vernacular switch on login; system font scaling honored to 200%.

### 5.1 Driver app (R-10) — the make-or-break surface
| Screen | Spec |
|---|---|
| D-01 Today | Duty card (vehicle, report time, route) + big **Start** button; below: khata balance chip, score chip. Nothing else. |
| D-02 Inspection | Checklist wizard: item → icon + photo button → OK/issue toggle; issue = photo + voice note; ≤2 min total; works gloved (48px targets). |
| D-03 Trip | Single active-state screen: current milestone + one primary CTA (Start / Arrived / Capture POD / Close); map thumbnail expands; nav hand-off to Google Maps; expense FAB (photo+amount, 15s); SOS persistent red corner (also on lock-screen widget). |
| D-04 ePOD | Camera-first: stamped-doc photo → OTP/sign fallback → exception toggle (short/damage/refused w/ photo count badge) → geo-stamp auto. |
| D-05 Khata | Statement list (vernacular labels, ₹ colored in/out), line-item → dispute button (voice/text + photo); settlement sign-off slider. |
| D-06 Documents | Offline wallet: DL, RC, insurance, permit, EWB active — full-screen render for checkpoints, works airplane-mode. |
| D-07 Score/Earnings | Monthly earnings statement (downloadable PDF — loan proof), km/l vs norm w/ incentive ₹, safety score w/ event list (video/coaching links). |
| D-08 SOS | Full-screen: breakdown / accident / medical / security big buttons → auto-location + call control room; usable logged-out. |

### 5.2 Vendor app/portal (R-11)
V-01 Indent inbox (accept/decline w/ vehicle+driver picker, countdown chip) · V-02 Placement tracker (doc-verdict fix-its inline) · V-03 My fleet & documents (expiry chips, upload) · V-04 Bills (submit wizard pre-filled from verified trips; status timeline to payment) · V-05 Scorecard (composite + components + share trend) · V-06 Drivers (roster, verification status). WhatsApp mirrors V-01/V-04 actions via signed links.

### 5.3 Employee app (R-17)
E-01 Book (3 fields, entitlement-aware defaults) · E-02 My trips (status stepper, approver visible) · E-03 Live commute (ETA, vehicle+driver card w/ verified badge, OTP big-type, share-trip) · E-04 SOS (one tap → control room + emergency contact) · E-05 Profile (stops, shifts, consents). Parent-mode variant for education pack (child's bus, boarding notifications).

### 5.4 Gate kiosk (R-16, PWA on rugged tablet)
G-01 Gate console: plate entry (ANPR-prefilled) → **verdict banner** (GREEN pass / RED stop + reason + "call dispatcher" button — no override control) → checklist (photos: load, seal, odo) → print pass. High-contrast, 56px targets, rain-glove friendly, works offline w/ retro-sync flag. G-02 Expected list (search, ETA).

### 5.5 Mechanic mobile (R-08)
W-01 My tasks (cards w/ vehicle + bay, clock-on slider) · W-02 Task detail (checklist, parts pick list w/ bin locations, serial scan, photo, clock-off) · W-03 Defect-found (camera → voice note → severity → submit; creates estimate-revision task). Vernacular default; zero typing paths.

## 6. Component Patterns (binding standards)

**6.1 Tables:** virtualized; sticky header + first column; column picker + saved views per user; inline state chips; row peek (slide-over) not navigation; bulk-select w/ action bar; filters as removable pills + advanced drawer; global search hits (`⌘K`) route to filtered tables; export respects visible columns + scope; empty/error/loading skeleton states mandatory; URL-encoded state (shareable links).
**6.2 Forms:** single-column ≤7 fields, sections beyond; inline validation on blur w/ rule ids; smart defaults from context; autosave drafts; destructive/override actions = typed-reason modal; date/number in Indian formats (lakh/crore toggle in finance screens); every form keyboard-submittable.
**6.3 Wizards:** stepper w/ save-and-exit; steps validate independently; review step shows diff/summary.
**6.4 Maps:** one map component everywhere (live, replay, geofence-edit, evidence) w/ mode props; offline tile cache for field apps.
**6.5 Approval cards:** what/who/₹/budget-left/policy-flags/history in one card; approve/reject/modify inline; renders identically in web inbox, mobile, email, WhatsApp.
**6.6 Evidence panel:** reusable right-pane combining map + photos + txn rows + sensor graph — used by fuel exceptions, toll disputes, challans, claims.
**6.7 Status chips:** state-machine states only (P1 C.x vocabulary) — never free-text status.

## 7. Responsive Matrix

| Surface | Desktop ≥1280 | Tablet 768–1279 | Mobile <768 |
|---|---|---|---|
| Dashboards | 12-col grid | 2-col stack | KPI carousel + queues |
| Dispatch board | 3-zone full | 2-zone (context modal) | **not offered** — monitor-only trip list (deliberate; assignment needs canvas) |
| Live map | full + list | full + drawer | full + bottom sheet |
| 360° records | tabs | tabs | accordion |
| Workbenches (bills/fuel) | two-pane | two-pane | queue + full-screen detail |
| Admin/config | full | read-mostly | read-only |

## 8. Accessibility, i18n, Dark Mode

WCAG 2.1 AA: contrast ≥4.5:1 (both themes), full keyboard paths (focus rings visible), ARIA on boards/maps (list-view parity for every canvas — dispatch board has an accessible table twin), screen-reader labels on status chips (color+icon+text triple), reduced-motion, error text not color-only. Hindi/regional: full string packs incl. numerals preference, ₹ formatting, date formats; text expansion budget +30% in layouts; voice input on driver dispute/defect fields. Dark mode: complete token set, wallboard/driver-night defaults, print styles force light. GIGW conformance items tracked for government tier.

## 9. UX Quality Gates (per release)

Task-success benchmarks (usability tests): dispatcher assigns 20 loads ≤10 min; driver closes trip incl. ePOD ≤90s; fuel exception disposition ≤60s; approver acts from email ≤30s; gate verdict ≤15s/vehicle. Instrument all (KPI-63/64/65 feed). Any screen failing its benchmark blocks GA of its module.

**Handoff:** Figma library mirrors §2 tokens + §6 components (one source of truth); screen files named S-xx/D-xx/V-xx/E-xx/G-xx/W-xx per this spec; dev handoff via tokens JSON + Storybook parity.

**Phase 6 next:** MVP/Phase-2/Enterprise split, effort estimates, risks, implementation order.

*— End of Phase 5 —*

