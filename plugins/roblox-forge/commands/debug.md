---
description: Diagnose and fix a bug in your Roblox game from an error message, Output log, or description
argument-hint: <error text or bug description>
---

Fix this Roblox bug: **$ARGUMENTS**

1. **Reproduce mentally:** parse the error (script path and line in the Output window map to files via the Rojo project). Identify whether it runs on the server or client.
2. **Investigate** the relevant code. Common Roblox causes to check: `WaitForChild` on something that never replicates (server-only location or StreamingEnabled), indexing a nil character/humanoid after death or respawn, race on `PlayerAdded` for players already in game, `require` cycles, yields inside `ProcessReceipt`/DataStore callbacks, client changes not replicating, missing `pcall` on web calls, deprecated APIs, type errors under `--!strict`.
3. Delegate if specialized: `data-engineer` for data loss/saving issues, `performance-engineer` for lag, `security-auditor` if the bug is an exploit.
4. **Fix** with the minimal correct change, explain the root cause in plain language, and say how to verify the fix in Studio.
