# DevKit

A privacy-first developer toolkit that runs entirely in your browser. No
backend, no tracking, no accounts — open `index.html` and use it.

## Tools

- **JSON** — format, minify, sort keys, validate
- **JWT** — decode header / payload / signature, highlight standard claims, flag expired tokens
- **Base64** — encode/decode UTF-8 text, optional URL-safe (base64url) mode
- **URL** — encodeURIComponent / decodeURIComponent
- **Regex** — live match highlighting, flags, captured groups
- **Hash** — SHA-1 / 256 / 384 / 512 via the browser's SubtleCrypto
- **UUID** — bulk v4 generation via `crypto.randomUUID()`
- **Timestamp** — Unix ↔ ISO-8601 ↔ local, with a live clock

## Running

No build step. Either:

```sh
# Option 1: just open the file
xdg-open index.html   # or: open index.html

# Option 2: serve it
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploying

Drop the three files on any static host (GitHub Pages, Netlify, Cloudflare
Pages, S3). There is no backend.

## Why?

Every developer pastes JWTs, JSON, and tokens into random online tools a few
times a week. Those sites log what you paste. This one can't — everything
happens in your tab.
