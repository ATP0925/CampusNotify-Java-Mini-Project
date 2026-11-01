# Project: CampusNotify Enterprise Academic ERP & 3D Portal

## Architecture
CampusNotify is an enterprise-grade academic operating system, 3D interactive workspace, AI Viva Voce proctored portal, and Mumbai University compliance ERP built with Spring Boot 3.3, Spring Security 6, Java 17/21, PostgreSQL / H2, Redis, React 19, Three.js, and Monaco Editor.

### Subsystem Boundaries
1. **Core Backend & Cryptographic Security (`backend/`)**:
   - Spring Security 6 stateless filter chain with sliding JWT renewal and Redis `jti` blacklist (L1).
   - Redis Read-Your-Own-Writes replica lag cache with write fencing tokens (L2).
   - Anti-proxy spatial delta velocity clamping & TLS JA4 fingerprinting (L3).
   - Dynamic TOTP QR rotation engine (HMAC-SHA256, 15s window) (L4).
   - Soft-delete invariants with partial unique indexing (L5).
   - AES-256-GCM envelope encryption for PII and DB attributes (L6).
   - RFC 4180 CSV formula neutralization (`CsvSanitizer`) (L7).
   - Two-man rule cryptographic hash chaining for grade/attendance revisions (L8).
2. **Academic ERP & Operations (`backend/academic/`)**:
   - Mumbai University Ordinance 6086 2-decimal attendance engine (`BigDecimal` precision).
   - Continuous 3-tier Defaulter Pipeline (D1: Warning <75%, D2: Parent Intimation <65%, D3: Detention Hearing <50%).
   - 25-Mark Term Work Formula Simulator ($TW = Attendance(5) + Lab(15) + Viva(5)$).
   - Smart Timetable Lecture Substitution Engine with faculty conflict matrix.
   - NAAC/NBA CO-PO Direct Attainment Engine.
   - Asynchronous 8-Node Dependency DAG No-Dues Clearance Engine (Kahn's topological sort, cycle detection, automatic UPI fine settlement, digital hall ticket issuance).
   - Gale-Shapley Deferred Acceptance Major Project Guide Allocation (composite scoring, quota limits, deterministic tie-breaking).
   - Chaumian Blind Signature anonymous faculty feedback protocol ($m^* \equiv H(m) \cdot r^e \pmod N$) with RSA blinded tokens and double-spend detection.
3. **Lab Submissions, Proctoring & AI Viva Voce (`backend/submission/` & `backend/viva/`)**:
   - Dynamic Problem Parameterization Engine: $N = (\text{Roll No} \pmod{50}) + 50$, $S = \text{Hash}(PRN) \pmod{10000}$ with zero-width Unicode steganographic watermarking.
   - Monaco Typing Dynamics Proctoring: $\Delta \text{chars}/\Delta t$ velocity clamping ($< 50\text{ chars}/100\text{ms}$), focus loss tracking, clipboard violation logging.
   - AI Viva Voce Examiner Service: 4-axis rubric scoring (Technical Depth, Problem Solving, Communication, Code Understanding), dynamic question generation, voice/text transcript assessment.
   - Faculty Submission Management: `SubmissionListModal` with batch roster synthesis (virtual missing entries), `BulkGradingModal` batch endpoints, redo request email dispatch via `JavaMailSender`.
4. **Modern Frontend & 3D Interactive Workspace (`frontend/`)**:
   - React 19 + TypeScript + Vite + Tailwind CSS GovTech Design System (`#0b1120`, `#151e32`, `#3b82f6`).
   - Three.js 3D Workspace: Campus navigation with department nodes, orbital camera, GLSL pulse beacon shaders; interactive 3D lab desk with dynamic canvas texture monitor rendering live terminal output.
   - AI Viva Voce Examiner UI: Animated avatar, AudioContext waveform visualizer, Web Speech API (STT/TTS), per-question countdown timer, rubric scoring cards.
   - Monaco Editor with client-side IndexedDB Write-Ahead Log (WAL) CRDT keystroke persistence (100ms debounce), focus lost alerts, and parameterized test runner.
   - Student & Faculty ERP Dashboards: Attendance gauge, D1/D2/D3 alerts, Term Work simulator, No-Dues DAG progression visualizer, Gale-Shapley guide preference ranker, backward-compatible notice board.
5. **E2E Testing Track (`test/e2e/`)**:
   - Opaque-box requirement-driven test suite spanning Tiers 1–4 (Feature, Boundary, Pairwise, Real-World Scenarios) and Tier 5 Adversarial Coverage Hardening.

---

## Feature Inventory
Every feature identified during Phase 0 survey is mapped to a milestone below. No feature is left unassigned.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Enterprise Build & Toolchain Scaffolding | Maven `pom.xml`, Java 17/21, Spring Boot 3.3, multi-module packaging | M1 | Survey 1 |
| 2 | Core Domain Entities (21 Entities) | JPA entities with JPA auditing, validation, and encrypted converters | M1 | Survey 1 |
| 3 | L1 Sliding JWT & Blacklist | Stateless security filter, sliding renewal token interceptor, Redis JTI revocation | M1 | Survey 1 |
| 4 | L2 Replica Lag & Read-Your-Own-Writes | Write-fencing tokens in Redis, replication lag fallback to primary DB | M1 | Survey 1 |
| 5 | L3 Proxy Mitigation & Spatial Delta | Client IP change detection, spatial delta velocity clamping, TLS JA4 hashing | M1 | Survey 1 |
| 6 | L4 Dynamic TOTP QR Rotation | 15s window HMAC-SHA256 rotating QR attendance token generation and verification | M1 | Survey 1 |
| 7 | L5 Soft-Delete Invariants | `deleted_at` timestamping, `@SQLRestriction`, partial unique indexes | M1 | Survey 1 |
| 8 | L6 AES-256-GCM Envelope Encryption | Entity attribute converters for PII, Aadhaar, parent contacts, salary details | M1 | Survey 1 |
| 9 | L7 RFC 4180 CSV Formula Neutralization | Neutralize formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`, `|`, `%`) on CSV import/export | M1 | Survey 1 & 2 |
| 10 | L8 Two-Man Rule Grade Revision Chaining | Cryptographic hash chaining (`SHA-256(prev_hash + change)`) for attendance/marks edits | M1 | Survey 1 |
| 11 | Authentication & User Management APIs | `/api/auth/login`, `/api/auth/refresh`, `/api/auth/mfa`, user profile endpoints | M1 | Survey 1 |
| 12 | MU Ordinance 6086 Attendance Engine | 2-decimal precision calculation using `BigDecimal` (rounding errors prevented) | M2 | Survey 1 |
| 13 | Continuous 3-Tier Defaulter Pipeline | D1 (<75% warning), D2 (<65% parent intimation), D3 (<50% detention hearing) | M2 | Survey 1 |
| 14 | Mumbai University 25-Mark TW Formula | $TW = \text{Attendance}(5) + \text{Lab}(15) + \text{Viva}(5)$ with dynamic weight calibration | M2 | Survey 1 |
| 15 | Lecture Substitution Engine | Timetable conflict detection, faculty availability matrix, auto-swap alerts | M2 | Survey 1 |
| 16 | NAAC/NBA CO-PO Direct Attainment | Calculation of Course Outcomes & Program Outcomes direct attainment matrices | M2 | Survey 1 |
| 17 | Asynchronous 8-Node DAG No-Dues Engine | Kahn's topological sort, cycle detection, UPI fee clearing, hall ticket issuance | M2 | Survey 2 |
| 18 | Gale-Shapley Guide Allocation Algorithm | Stable matching for Sem 7/8 Major Project guides with composite score & tie-breaking | M2 | Survey 2 |
| 19 | Chaumian Blind Signature Feedback Protocol | Anonymous faculty feedback via RSA blinded tokens ($m^* \equiv H(m) \cdot r^e \pmod N$) | M2 | Survey 2 |
| 20 | Dynamic Test Vector Parameterization | Roll-no parameterized inputs ($N = (\text{Roll} \pmod{50})+50$) & zero-width steganography | M3 | Survey 2 |
| 21 | Monaco Typing Dynamics & Velocity Clamping | $\Delta \text{chars}/\Delta t < 50\text{ chars}/100\text{ms}$ velocity clamping, `FOCUS_LOST` audit logs | M3 | Survey 2 & 3 |
| 22 | AI Viva Voce Evaluation Engine | 4-axis rubric scoring, dynamic audio/text question generation, transcript evaluation | M3 | Survey 2 & 3 |
| 23 | Lab Practical & Assignment Management | Assignment creation, submission lifecycle, plagiarism/proctoring telemetry | M3 | Survey 2 |
| 24 | Faculty SubmissionListModal Backend | Batch roster synthesis (virtual missing entries), bulk status update, filter tabs | M3 | Survey 2 |
| 25 | Bulk Grading & Redo Request Dispatch | Batch grading adoption, redo request email dispatch via `JavaMailSender` | M3 | Survey 2 |
| 26 | React 19 + Vite + Tailwind Setup | Modern frontend foundation with TypeScript, Zustand stores, GovTech design system | M4 | Survey 3 |
| 27 | Three.js Interactive Campus Navigation | 3D department nodes, orbital camera, GLSL pulse beacon shaders | M4 | Survey 3 |
| 28 | Three.js 3D Lab Desk Workspace | Interactive 3D desk with dynamic canvas texture monitor rendering live terminal | M4 | Survey 3 |
| 29 | AI Viva Voce Examiner UI | Animated avatar, Web Audio API waveform visualizer, Web Speech STT/TTS, timer | M4 | Survey 3 |
| 30 | Monaco Editor CRDT Keystroke Persistence | IndexedDB Write-Ahead Log (WAL) with 100ms debounce for power-cut recovery | M4 | Survey 2 & 3 |
| 31 | Student & Faculty ERP Dashboards | Attendance gauge, D1-D3 alerts, TW simulator, No-Dues DAG visualizer, guide ranker | M4 | Survey 3 |
| 32 | Submission & Faculty Modals UI | `SubmissionListModal` with virtual missing records, `BulkGradingModal`, diff viewer | M4 | Survey 2 & 3 |
| 33 | Notice Board & Official Letterhead | Backward-compatible circular notice feed, search, printable official letterhead | M4 | Survey 3 |
| 34 | E2E Requirement-Driven Test Suite | Tiers 1-4 opaque-box testing covering all functional and boundary requirements | M5 (Test Track) | Survey 1, 2, 3 |
| 35 | Tier 5 Adversarial Coverage Hardening | White-box adversarial testing, edge cases, chaos and stress hardening | M5 (Phase 2) | Survey 1, 2, 3 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Security & Crypto Foundation (`M1_BACKEND_SECURITY`) | Maven scaffolding, 21 JPA entities, 8-layer immunity matrix, DB schema, Auth APIs | None | DONE |
| M2 | Academic ERP Engine & Operations (`M2_ACADEMIC_OPS`) | MU Ordinance 6086, Defaulter D1-D3, TW 25M, Swap, DAG No-Dues, Gale-Shapley, Chaumian | M1 | DONE |
| M3 | Lab Submissions, Proctoring & AI Viva (`M3_SUBMISSION_VIVA`) | Parameterized vectors, Monaco velocity clamping, AI Viva evaluation, Faculty grading APIs | M1 | DONE |
| M4 | Modern React 19 Frontend & 3D Workspace (`M4_FRONTEND_3D`) | React 19 Vite app, Three.js campus & desk, AI Viva UI, Monaco CRDT WAL, ERP dashboards | M1, M2, M3 | DONE |
| M5 | Final E2E Test Suite 100% Pass (`M5_FINAL_INTEGRATION`) | Pass 100% E2E tests (Tiers 1-4) followed by Phase 2 Tier 5 Adversarial Hardening | M1, M2, M3, M4, TEST_READY | DONE |
| ET | E2E Testing Track (`E2E_TEST_TRACK`) | Requirement-driven test harness, Tiers 1-4 test cases, publish `TEST_READY.md` | Independent (Parallel) | DONE |

---

## Interface Contracts

### 1. Authentication & Security Layer ↔ All Subsystems
- **JWT Header**: `Authorization: Bearer <token>`
- **Token Claims**: `sub: UUID`, `role: [STUDENT, FACULTY, HOD, ADMIN]`, `dept: String`, `prn: String`, `jti: UUID`, `exp: Long`
- **Sliding Refresh Response**: `X-Renewed-Token: <new_token>`
- **Response Format**:
  ```json
  {
    "status": "SUCCESS | ERROR",
    "timestamp": "ISO-8601",
    "data": {},
    "error": { "code": "STRING", "message": "STRING" }
  }
  ```

### 2. Academic ERP Engine ↔ Frontend & Student Portals
- `GET /api/academic/attendance/summary?studentId={id}`: Returns 2-decimal attendance, aggregate percentage, and D1/D2/D3 classification.
- `GET /api/academic/termwork/calculate?studentId={id}&subjectId={id}`: Returns breakdown: attendance marks (0-5), lab marks (0-15), viva marks (0-5), total (0-25).
- `POST /api/academic/nodues/initiate`: Initiates 8-node DAG clearance workflow for student.
- `GET /api/academic/nodues/status?studentId={id}`: Returns DAG adjacency status, completed nodes, pending blockers, and hall ticket unlock flag.
- `POST /api/academic/allocation/submit-preferences`: Submits student project preferences for Gale-Shapley matching.
- `POST /api/academic/feedback/blind-submit`: Submits Chaumian blind-signed feedback token and blinded rating.

### 3. Lab Submissions & Proctoring ↔ Monaco IDE & AI Viva
- `GET /api/practicals/{id}/parameterized-spec?studentId={id}`: Returns dynamically computed problem parameters ($N, S$) with steganographic watermark.
- `POST /api/submissions/proctoring-event`: Receives telemetry payload (`velocity`, `focus_lost_duration`, `paste_event_length`, `crdt_seq`).
- `POST /api/viva/evaluate`: Evaluates student audio/text response across 4-axis rubric; returns `technical_score`, `depth_score`, `communication_score`, `overall_marks (0-5)`.
- `POST /api/faculty/submissions/bulk-grade`: Accepts batch array `[{ submissionId, marks, feedback }]`.

---

## Code Layout

```
CampusNotify-Java-Mini-Project/
├── backend/
│   ├── pom.xml                               # Root Spring Boot 3 Maven descriptor
│   └── src/
│       ├── main/
│       │   ├── java/com/campusnotify/
│       │   │   ├── CampusNotifyApplication.java
│       │   │   ├── config/                   # SecurityConfig, RedisConfig, WebConfig
│       │   │   ├── security/                 # JwtFilter, SlidingRenewal, Blacklist, CsvSanitizer
│       │   │   ├── entity/                   # 21 JPA entities (User, Submission, Attendance, etc.)
│       │   │   ├── repository/               # Spring Data JPA repositories
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── AttendanceEngine.java # MU Ordinance 6086 & Defaulter pipeline
│       │   │   │   ├── TermWorkService.java  # 25-mark Term Work engine
│       │   │   │   ├── NoDuesDagEngine.java  # Kahn's DAG clearance
│       │   │   │   ├── GaleShapleyService.java # Major project allocation
│       │   │   │   ├── ChaumianFeedbackService.java # RSA blind signatures
│       │   │   │   ├── ProctoringService.java# Velocity clamping & telemetry
│       │   │   │   ├── AiVivaService.java    # AI Viva Voce evaluation
│       │   │   │   └── FacultySubmissionService.java # SubmissionListModal & bulk grading
│       │   │   └── controller/               # REST endpoints
│       │   └── resources/
│       │       ├── application.yml           # Configuration (PostgreSQL/H2, Redis)
│       │       └── db/migration/             # Flyway SQL migrations
│       └── test/                             # Backend unit and integration tests
├── frontend/
│   ├── package.json                          # React 19, Three.js, Monaco, Zustand, Tailwind
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── components/
│       │   ├── three/                        # CampusScene.tsx, LabDeskWorkspace.tsx, Shaders
│       │   ├── viva/                         # VivaExaminerModal.tsx, AudioWaveform.tsx
│       │   ├── editor/                       # MonacoEditorProctored.tsx, CrdtWalManager.ts
│       │   ├── erp/                          # AttendanceGauge.tsx, NoDuesDagVisualizer.tsx, TermWorkSim.tsx
│       │   └── modals/                       # SubmissionListModal.tsx, BulkGradingModal.tsx
│       ├── stores/                           # Zustand reactive state stores
│       └── services/                         # REST & WebSocket API clients
├── test/
│   └── e2e/                                  # Opaque-box requirement-driven test suite
│       ├── test_runner.js                    # Unified test runner
│       ├── tier1_features/
│       ├── tier2_boundaries/
│       ├── tier3_pairwise/
│       └── tier4_real_world/
├── .agents/teamwork/                         # Agent metadata only
└── PROJECT.md                                # Global project blueprint
```
