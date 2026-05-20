---
description: Complete software development workflow - from spec to shipped feature
---

Run the full development workflow for this feature. Follow every step:

## Phase 1: Spec
- Clarify requirements (ask me if unclear)
- Write a brief spec in tasks/todo.md
- Identify affected files and dependencies
- Get my approval before proceeding

## Phase 2: Research (via subagents)
- Explore the codebase for related patterns
- Check for existing utilities or components to reuse
- Identify potential conflicts

## Phase 3: Implement
- Write the code following existing patterns
- Use TypeScript strictly
- Follow the design system (globals.css variables)
- Keep changes minimal and focused

## Phase 4: Verify
- Run `tsc` — zero new errors
- Test the feature manually (describe what to check)
- Check for regressions in related features
- Review for security issues (auth, input validation, data exposure)

## Phase 5: Polish
- Clean up any rough edges
- Ensure responsive design
- Add loading/error states where needed
- Review code for elegance

What feature are we building?
