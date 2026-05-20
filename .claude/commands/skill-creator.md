---
description: Build a new custom Claude Code skill/command from a description
---

Help me create a new custom Claude Code skill (slash command). I'll describe what I want it to do, and you'll:

1. **Clarify** — Ask me what the skill should do, when I'd use it, and what output I expect
2. **Design** — Draft the skill's markdown prompt with:
   - Clear description in the frontmatter
   - Step-by-step instructions for Claude to follow
   - Any project-specific context it needs
   - Expected output format
3. **Create** — Write the file to `.claude/commands/<skill-name>.md`
4. **Test** — Explain how to invoke it (`/skill-name`) and what to expect

Tips for good skills:
- Be specific about what you want Claude to do and NOT do
- Include project context (tech stack, conventions, file locations)
- Define the output format clearly
- Keep it focused — one skill, one job

What skill do you want to create?
