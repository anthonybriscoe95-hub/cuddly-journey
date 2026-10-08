---
description: Full code review of your Roblox project or recent changes — security/exploits, performance, data safety, and Luau quality
argument-hint: [path or "recent changes" — defaults to the whole src/ tree]
---

Review this Roblox code: **$ARGUMENTS** (if nothing was given, review the project's `src/` directory)

If the target is "recent changes" or a git repo with uncommitted work, focus on `git diff` (and `git diff --cached`); otherwise review the given path.

Run these reviewers **in parallel**, each given the same scope:
- `security-auditor` — remotes, server authority, economy, purchases, text filtering, secrets on the client.
- `performance-engineer` — leaks, hot loops, physics/rendering issues, network chattiness (static review — note what to profile).
- `data-engineer` — only if the scope touches DataStores, ProfileStore, purchases, or teleports.
- Yourself — Luau quality against the `luau-best-practices` skill: `--!strict`, types, deprecated APIs, structure, naming.

Then produce one consolidated report:
1. **Summary** — overall health in 2–3 sentences.
2. **Findings** ranked Critical → High → Medium → Low, deduplicated, each with `file:line`, the problem, why it matters, and the fix.
3. **Quick wins** — the 3–5 changes with the best impact for effort.

Ask before applying fixes unless the user requested them.
