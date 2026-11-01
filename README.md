# Gatherly AI — Event Planning Engine

> **Milestone 2**: Real GenAI Event Planning Engine powered by Google Gemini and TypeScript.

Gatherly AI transforms celebratory event logistics into bespoke, structured event plans. It integrates a secure serverless architecture, runtime schema validation, an application-code financial calculation engine, and dynamic section regeneration.

## Problem Statement

Event hosts often have the celebration idea but not a practical way to turn guest count, location, budget, dietary needs, and logistics into an executable plan. Gatherly AI converts those inputs into a tailored concept, reconciled budget, run-of-show timeline, vendor guidance, risks, and readiness checklist.

## Tech Stack

- React 19, TypeScript, Vite, and Tailwind CSS
- Google Gemini through the server-only `@google/genai` SDK
- Vercel serverless functions for production API execution
- Zod for request and response validation
- Vitest and ESLint for automated verification

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite                      │
│                  TypeScript Client                     │
│  (State: Draft, Generated Plan, LocalStorage, Zod)     │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/generate-plan
                            │ (JSON Payload, No Secrets)
                            ▼
┌────────────────────────────────────────────────────────┐
│         Vercel Serverless Function (/api)              │
│       or Vite Dev Middleware in Local Server           │
│                                                        │
│  - Request Validation via Zod Schemas                  │
│  - Reads GEMINI_API_KEY from process.env               │
│  - Timeout Guard (30s) & Rate Limit Handler            │
│  - Safe JSON Extractor & Sanitized Error Handler       │
└───────────────────────────┬────────────────────────────┘
                            │ Official SDK (@google/genai)
                            │ responseMimeType: "application/json"
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Google Gemini Flash (configurable)     │
│         Structured AI Event Concept Generation         │
└────────────────────────────────────────────────────────┘
```

### Key Security & Architectural Guarantees
1. **Zero Client Secret Exposure**: The frontend bundle never imports `@google/genai` and never accesses `GEMINI_API_KEY`.
2. **Server-Side API Endpoint**: Implemented at `/api/generate-plan.ts` as a Vercel-compatible serverless function.
3. **Local Dev Integration**: A built-in Vite dev server plugin intercepts `/api/generate-plan` during `npm run dev`, allowing full local development without requiring external proxies.
4. **Pure Application-Code Budget Engine**: AI only suggests percentage allocations; exact currency totals, cent rounding, and per-guest metrics are computed strictly by application code (`src/utils/budgetEngine.ts`). Category sums strictly reconcile with the user's allocated budget.
5. **Runtime Validation**: Incoming requests and outgoing AI plans are strictly validated with Zod schemas (`src/types/generatedPlan.ts` and `src/utils/planValidator.ts`).

---

## Features

### 1. Validated Event Information
Accepts and validates complete celebration specifications:
- Event name & archetype (`wedding`, `birthday`, `anniversary`, `community`, `dinner_party`, `corporate`)
- Scheduled future date
- City / location
- Guest count (1 to 100,000)
- Target budget & currency (`USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`)
- Dietary requirements (`omnivore`, `vegetarian`, `vegan`, `halal`, `kosher`, `gluten_free`, `nut_free`)
- Aesthetic theme & vibe
- Special requirements and accessibility directives

### 2. Structured GenAI Event Plan
Generates a structured plan conforming to TypeScript types and Zod runtime schemas:
- **Event Concept**: Narrative summary, aesthetic theme ideas, decor & tablescapes, curated activities, catering highlights, and sensory ambiance.
- **Budget Allocations**: Category breakdown reconciled to the user's budget with overflow detection and planning guidelines disclaimer.
- **Run-of-Show Timeline**: Multi-stage chronology across preparation milestones, final week countdown, and concise hour-by-hour day-of scheduling.
- **Readiness Checklist**: Concise actionable tasks categorized by Vendor, Logistics, Guests, Decor, and Safety with priorities and completion tracking.
- **Local Vendors**: Service categories, scope of work, local tips for the target city, and lead times.
- **Risks & Contingencies**: Tailored failure modes and practical mitigation strategies.

### 3. Dynamic Section Regeneration
- **Full Regeneration**: One-click complete plan regeneration.
- **Granular Section Regeneration**: Regenerate only the concept, budget, timeline, checklist, or vendors.
- **Preservation of User Edits**: User-added checklist items and completed checkboxes are strictly preserved across regenerations.
- **Budget Scalability**: Changing budget or guest count in draft dynamically recalibrates category line items and per-guest costs.

### 4. Resilient Error Handling & Retry Interface
- User-friendly error notifications with attempt counters.
- If generation fails, any existing valid plan is never overwritten.
- Buttons and triggers are disabled during flight to prevent duplicate submissions.
 - Timeouts (504), rate limits (429), missing keys (503), and malformed outputs (502) are caught and presented with retry buttons. Full-plan requests use the fast Flash-Lite model and a 30-second server guard.

---

## Local Development Setup

### 1. Prerequisites
- Node.js 20+ installed
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` in the project root:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Gemini API key:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173`. The local dev server automatically handles `/api/generate-plan` calls using the API handler and your local `.env.local` key.

Alternatively, if you use the Vercel CLI:
```bash
vercel dev
```

---

## Running Verification Tests & Quality Checks

Run the automated test suite (31 unit tests covering all Milestone 2 requirements):
```bash
npm test
```

Run TypeScript compilation and production bundle build:
```bash
npm run build
```

Run ESLint:
```bash
npm run lint
```

---

## Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add these for the Production environment (and Preview if you want preview deployments to generate plans):
   - Name: `GEMINI_API_KEY`
   - Value: `<your-google-gemini-api-key>`
   - Name: `GEMINI_MODEL`
   - Value: `gemini-3.5-flash-lite`
4. Deploy. Vercel automatically builds the Vite frontend and provisions `/api/generate-plan.ts`; no `vercel.json` is required for this layout.

---

## File Architecture

```
├── api/
│   └── generate-plan.ts             # Vercel serverless function (Gemini API integration)
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardOverview.tsx # Integrated workspace dashboard
│   │   │   ├── GenerationPanel.tsx   # Generation CTA, progress spinner, error & retry UI
│   │   │   ├── AiEventConcept.tsx    # Personalized concept, decor, ambiance, tips, risks
│   │   │   ├── AiBudgetTracker.tsx   # Reconciled budget breakdown & disclaimers
│   │   │   ├── AiTimeline.tsx        # Preparation, week-of, day-of run-of-show
│   │   │   └── AiChecklist.tsx       # Interactive task board, filters, export, user tasks
│   │   └── planner/
│   │       └── EventPlannerForm.tsx  # Validated celebration configuration form
│   ├── hooks/
│   │   └── useEventPlan.ts           # State manager, localStorage sync, generation & retry
│   ├── types/
│   │   ├── event.ts                  # Event draft & form types
│   │   └── generatedPlan.ts          # Zod schemas & TypeScript types for generated plans
│   ├── utils/
│   │   ├── apiClient.ts              # Client API service for /api/generate-plan
│   │   ├── budgetEngine.ts           # Pure application-code financial calculations
│   │   ├── planValidator.ts          # Runtime response validation & sanitization
│   │   └── formatters.ts             # Currency and date formatters
│   └── tests/
│       ├── apiHandler.test.ts        # Serverless API tests (valid, invalid, key missing, timeout)
│       ├── budgetEngine.test.ts      # Budget calculations, reconciliation, overflow tests
│       ├── planValidator.test.ts     # Zod runtime schema & edge-case parser tests
│       └── regenerationAndPreservation.test.ts # Section regeneration & user data preservation
├── vite.config.ts                    # Vite configuration with built-in API dev server plugin
├── tsconfig.json                     # TypeScript compiler configuration (ES2022)
└── package.json                      # Scripts and dependencies
```

#   P r o m p t w a r _ C h a l l l e n g e _ 5  
 