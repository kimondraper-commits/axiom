# AXIOM — Urban Intelligence Platform

## Project Overview
AXIOM is a city planning platform for NSW government planners.
It provides GIS maps, calculators, project management, AI assistance,
and data analytics in one integrated platform.

## Tech Stack
- Next.js 16 (Turbopack), TypeScript, Tailwind CSS v4
- Prisma ORM, PostgreSQL
- NextAuth for authentication
- Recharts (charts), Mapbox GL (maps)

## Design System (Post-Rebrand)
- Theme: Dark mode with green tech accents
- Accent: --green #00e87b
- Surfaces: --black #04060a, --deep #080c10, --surface #0d1117, --panel #111820
- Fonts: Exo 2 (--font-exo), Chakra Petch (--font-chakra), Rajdhani (--font-rajdhani), Share Tech Mono (--font-mono)
- Compatibility aliases in globals.css: --void, --carbon, --gold, --gold-dim resolve to green equivalents
- All text is light on dark. No white backgrounds anywhere.
- Inline `style` props with CSS variables preferred over Tailwind color classes

## Build Commands
- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check without build
- `npx prisma db push` — sync schema to database
- `npx prisma generate` — regenerate Prisma client

## Known TS Errors (pre-existing, safe to ignore)
- `src/lib/auth.ts` — adapter type mismatch (next-auth version conflict)
- `src/app/api/maps/layers/route.ts` — Prisma JsonNull typing issue

## Rules
- Never use bright blue (#3b82f6) — always use green (#00e87b)
- Never use white backgrounds — always use --black or --deep
- All stat labels use Share Tech Mono, uppercase, letter-spacing 2px
- Calculator outputs must cite their data source (ABS, DCCEW, etc.)
- The brand name is "AXIOM" — never "Uruk" or "Uruk Pro"
- NSW planning standards only — no US/UK references (no CEQA, use EP&A Act)
- Date format: "en-AU" (not "en-US")

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to 'tasks/todo.md' with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to 'tasks/todo.md'
6. **Capture Lessons**: Update 'tasks/lessons.md' after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
