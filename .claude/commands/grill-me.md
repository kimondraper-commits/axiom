---
description: Grill your idea before coding - validates design, catches edge cases, and stress-tests architecture
---

Before I write any code, I need you to ruthlessly grill my idea. Act as a senior staff engineer doing a design review.

Ask me tough questions about:
1. **Problem definition** — Is this actually solving a real problem? What's the user story?
2. **Architecture** — Is this the right approach? What alternatives did I consider?
3. **Edge cases** — What happens when things go wrong? Empty states, errors, race conditions?
4. **Data model** — Does the schema make sense? Will it scale? Any normalization issues?
5. **Security** — Any auth gaps, injection risks, or data exposure?
6. **Performance** — Will this be slow? N+1 queries? Unnecessary re-renders?
7. **Complexity** — Am I overengineering this? Is there a simpler way?

Don't be nice. Poke holes. If the idea survives your grilling, it's ready to build. If not, help me redesign it.

Start by asking: "What are you trying to build and why?"
