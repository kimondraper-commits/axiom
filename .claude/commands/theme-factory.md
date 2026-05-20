---
description: Manage and enforce brand consistency automatically across the project
---

Audit and enforce brand consistency across the entire project. Check:

## Brand Tokens (from globals.css)
- Accent: `--green: #00e87b` (NO gold, NO blue, NO other accent colors)
- Surfaces: `--black #04060a`, `--deep #080c10`, `--surface #0d1117`, `--panel #111820`
- Fonts: Exo 2 (headings), Chakra Petch (UI), Rajdhani (data), Share Tech Mono (code/mono)
- Aliases: `--void`, `--carbon`, `--gold`, `--gold-dim` all resolve to green equivalents

## Audit Steps
1. Search for any hardcoded colors that don't match the design system
2. Check for inconsistent font usage (wrong font for context)
3. Verify all components use CSS variables, not raw hex values
4. Check for any old gold/blue branding remnants
5. Ensure hover/focus states use the correct accent color
6. Verify dark theme contrast ratios are accessible

## Fix
- Replace any violations with the correct design tokens
- Report what was found and fixed

Run the audit now.
