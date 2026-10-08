---
description: Write or update the game design document (docs/GDD.md) for your Roblox game
argument-hint: <game idea or what to update>
---

Use the `game-designer` agent (with the `game-design-doc` skill template) to write or update `docs/GDD.md` for: **$ARGUMENTS**

- If `docs/GDD.md` exists, read it first and update it in place, preserving decisions unless the user asked to change them.
- If the design would benefit from market context and none exists, run `game-researcher` first (in parallel with reading the project).
- Have `monetization-designer` fill in the Economy and Monetization sections.
- Finish with a short summary of the core loop, MVP scope, and open questions for the user.
