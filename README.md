# 🥕 Leftover Chef

Snap a photo of your fridge or pantry — get three real recipes you can cook right now, ranked by what's about to go bad.

**Live app:** https://anthonybriscoe95-hub.github.io/cuddly-journey/

## How it works

1. Open the site, click ⚙︎ Settings, paste an [Anthropic API key](https://console.anthropic.com/).
2. Take or upload a photo of your ingredients.
3. Optionally pick a diet, time budget, or add notes.
4. Hit **Find recipes** → Claude (`claude-sonnet-4-6`, vision) identifies what's in the photo, flags items that look urgent, and writes three recipes that mostly use what you have.

## Privacy

- It's a static site. There is no backend.
- Your API key is stored in your browser's `localStorage` and sent only to `api.anthropic.com`.
- Photos are sent to Anthropic for the vision call and are not stored anywhere by this app.

## Stack

Plain HTML / CSS / JS — no build step. Calls the Anthropic Messages API directly from the browser using `anthropic-dangerous-direct-browser-access: true`.

## Deploy

Pushes to `main` or `claude/app-ideas-brainstorm-LRed7` deploy automatically to GitHub Pages via `.github/workflows/deploy.yml`. To enable: in the repo, go to **Settings → Pages → Source: GitHub Actions** (one-time).
