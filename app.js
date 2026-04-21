(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const setStatus = (el, msg, kind = '') => {
    el.textContent = msg;
    el.className = 'status' + (kind ? ' ' + kind : '');
  };

  // ---------- Tabs ----------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach((t) => {
    t.addEventListener('click', () => {
      const tool = t.dataset.tool;
      tabs.forEach((x) => x.classList.toggle('active', x === t));
      panels.forEach((p) => p.classList.toggle('active', p.id === 'tool-' + tool));
      history.replaceState(null, '', '#' + tool);
    });
  });
  const initial = location.hash.replace('#', '');
  if (initial) {
    const t = document.querySelector(`.tab[data-tool="${initial}"]`);
    if (t) t.click();
  }

  // ---------- Theme ----------
  const themeBtn = $('themeToggle');
  const savedTheme = localStorage.getItem('devkit-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = cur;
    localStorage.setItem('devkit-theme', cur);
  });

  // ---------- Copy buttons ----------
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const src = $(btn.dataset.copy);
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src.value ?? src.textContent ?? '');
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = original), 1200);
    } catch {
      alert('Copy failed — your browser blocked clipboard access.');
    }
  });

  // ---------- JSON ----------
  const jsonIn = $('json-input');
  const jsonOut = $('json-output');
  const jsonStatus = $('json-status');
  const jsonIndentSel = $('json-indent');

  const indentVal = () => {
    const v = jsonIndentSel.value;
    return v === 'tab' ? '\t' : Number(v);
  };

  const sortKeys = (v) => {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === 'object') {
      const out = {};
      for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
      return out;
    }
    return v;
  };

  const jsonActions = {
    'json-format': () => {
      const parsed = JSON.parse(jsonIn.value);
      jsonOut.value = JSON.stringify(parsed, null, indentVal());
      setStatus(jsonStatus, 'Valid JSON — formatted.', 'ok');
    },
    'json-minify': () => {
      const parsed = JSON.parse(jsonIn.value);
      jsonOut.value = JSON.stringify(parsed);
      setStatus(jsonStatus, 'Valid JSON — minified.', 'ok');
    },
    'json-sort': () => {
      const parsed = JSON.parse(jsonIn.value);
      jsonOut.value = JSON.stringify(sortKeys(parsed), null, indentVal());
      setStatus(jsonStatus, 'Keys sorted alphabetically.', 'ok');
    },
  };

  // ---------- Base64 ----------
  const b64Left = $('b64-left');
  const b64Right = $('b64-right');
  const b64Status = $('b64-status');
  const b64UrlSafe = $('b64-urlsafe');

  const toB64 = (str, urlSafe) => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    let out = btoa(binary);
    if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return out;
  };
  const fromB64 = (str, urlSafe) => {
    let s = str.trim();
    if (urlSafe) {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
    }
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  };

  const b64Actions = {
    'b64-encode': () => {
      b64Right.value = toB64(b64Left.value, b64UrlSafe.checked);
      setStatus(b64Status, 'Encoded.', 'ok');
    },
    'b64-decode': () => {
      b64Left.value = fromB64(b64Right.value, b64UrlSafe.checked);
      setStatus(b64Status, 'Decoded.', 'ok');
    },
  };

  // ---------- URL ----------
  const urlLeft = $('url-left');
  const urlRight = $('url-right');
  const urlStatus = $('url-status');

  const urlActions = {
    'url-encode': () => {
      urlRight.value = encodeURIComponent(urlLeft.value);
      setStatus(urlStatus, 'Encoded.', 'ok');
    },
    'url-decode': () => {
      urlLeft.value = decodeURIComponent(urlRight.value);
      setStatus(urlStatus, 'Decoded.', 'ok');
    },
  };

  // ---------- UUID ----------
  const uuidOut = $('uuid-out');
  const uuidCount = $('uuid-count');
  const uuidActions = {
    'uuid-gen': () => {
      const n = Math.min(1000, Math.max(1, Number(uuidCount.value) || 1));
      const out = [];
      for (let i = 0; i < n; i++) out.push(crypto.randomUUID());
      uuidOut.value = out.join('\n');
    },
  };

  // ---------- Wire up simple actions ----------
  const allActions = { ...jsonActions, ...b64Actions, ...urlActions, ...uuidActions };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const fn = allActions[btn.dataset.act];
    if (!fn) return;
    try {
      fn();
    } catch (err) {
      const statusId = btn.dataset.act.split('-')[0] + '-status';
      const map = { json: jsonStatus, b64: b64Status, url: urlStatus };
      const el = map[btn.dataset.act.split('-')[0]];
      if (el) setStatus(el, 'Error: ' + err.message, 'err');
    }
  });

  // Initial UUIDs so the page isn't empty
  uuidActions['uuid-gen']();

  // ---------- JWT ----------
  const jwtIn = $('jwt-input');
  const jwtHeader = $('jwt-header');
  const jwtPayload = $('jwt-payload');
  const jwtSig = $('jwt-sig');
  const jwtClaims = $('jwt-claims');
  const jwtStatus = $('jwt-status');

  const b64urlDecode = (s) => fromB64(s, true);

  const fmtEpoch = (n) => {
    if (typeof n !== 'number') return String(n);
    const d = new Date(n * 1000);
    if (isNaN(d.getTime())) return String(n);
    return `${n} (${d.toISOString()})`;
  };

  const describeClaims = (payload) => {
    if (!payload || typeof payload !== 'object') return '';
    const lines = [];
    const now = Math.floor(Date.now() / 1000);
    if ('iss' in payload) lines.push(`iss (issuer):    ${payload.iss}`);
    if ('sub' in payload) lines.push(`sub (subject):   ${payload.sub}`);
    if ('aud' in payload) lines.push(`aud (audience):  ${JSON.stringify(payload.aud)}`);
    if ('iat' in payload) lines.push(`iat (issued):    ${fmtEpoch(payload.iat)}`);
    if ('nbf' in payload) lines.push(`nbf (not before):${fmtEpoch(payload.nbf)}`);
    if ('exp' in payload) {
      const exp = payload.exp;
      const state = typeof exp === 'number' ? (exp < now ? '  ⚠ EXPIRED' : '  ✓ valid') : '';
      lines.push(`exp (expires):   ${fmtEpoch(exp)}${state}`);
    }
    if ('jti' in payload) lines.push(`jti (id):        ${payload.jti}`);
    return lines.join('\n');
  };

  const decodeJwt = () => {
    const token = jwtIn.value.trim();
    jwtHeader.textContent = '';
    jwtPayload.textContent = '';
    jwtSig.textContent = '';
    jwtClaims.textContent = '';
    if (!token) return setStatus(jwtStatus, '');
    const parts = token.split('.');
    if (parts.length !== 3) {
      return setStatus(jwtStatus, 'JWT must have 3 dot-separated parts.', 'err');
    }
    try {
      const h = JSON.parse(b64urlDecode(parts[0]));
      const p = JSON.parse(b64urlDecode(parts[1]));
      jwtHeader.textContent = JSON.stringify(h, null, 2);
      jwtPayload.textContent = JSON.stringify(p, null, 2);
      jwtSig.textContent = parts[2];
      jwtClaims.textContent = describeClaims(p);
      setStatus(jwtStatus, 'Decoded. Signature NOT verified.', 'ok');
    } catch (err) {
      setStatus(jwtStatus, 'Invalid JWT: ' + err.message, 'err');
    }
  };
  jwtIn.addEventListener('input', decodeJwt);

  // ---------- Regex ----------
  const rxPattern = $('regex-pattern');
  const rxFlags = $('regex-flags');
  const rxInput = $('regex-input');
  const rxHighlight = $('regex-highlight');
  const rxMatches = $('regex-matches');
  const rxStatus = $('regex-status');

  const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const runRegex = () => {
    const pat = rxPattern.value;
    const flags = rxFlags.value;
    const text = rxInput.value;
    rxHighlight.innerHTML = '';
    rxMatches.textContent = '';
    if (!pat) return setStatus(rxStatus, '');
    let re;
    try {
      re = new RegExp(pat, flags.includes('g') ? flags : flags + 'g');
    } catch (err) {
      return setStatus(rxStatus, 'Invalid pattern: ' + err.message, 'err');
    }
    const matches = [];
    let out = '';
    let last = 0;
    let m;
    let count = 0;
    while ((m = re.exec(text)) && count < 10000) {
      if (m.index === re.lastIndex) re.lastIndex++;
      const [full] = m;
      out += escapeHtml(text.slice(last, m.index));
      out += '<mark>' + escapeHtml(full) + '</mark>';
      last = m.index + full.length;
      matches.push({ match: full, index: m.index, groups: m.slice(1) });
      count++;
      if (!flags.includes('g')) break;
    }
    out += escapeHtml(text.slice(last));
    rxHighlight.innerHTML = out || '<span style="color:var(--muted)">(no input)</span>';
    rxMatches.textContent = matches.length
      ? matches.map((x, i) => `#${i} @${x.index}  "${x.match}"` + (x.groups.length ? '  groups=' + JSON.stringify(x.groups) : '')).join('\n')
      : '(no matches)';
    setStatus(rxStatus, `${matches.length} match${matches.length === 1 ? '' : 'es'}.`, matches.length ? 'ok' : '');
  };
  [rxPattern, rxFlags, rxInput].forEach((el) => el.addEventListener('input', runRegex));

  // ---------- Hash ----------
  const hashIn = $('hash-input');
  const hashEls = {
    'SHA-1':   $('hash-sha1'),
    'SHA-256': $('hash-sha256'),
    'SHA-384': $('hash-sha384'),
    'SHA-512': $('hash-sha512'),
  };
  const toHex = (buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  let hashSeq = 0;
  const runHashes = async () => {
    const my = ++hashSeq;
    const text = hashIn.value;
    if (!text) {
      Object.values(hashEls).forEach((el) => (el.textContent = ''));
      return;
    }
    const data = new TextEncoder().encode(text);
    for (const [alg, el] of Object.entries(hashEls)) {
      try {
        const buf = await crypto.subtle.digest(alg, data);
        if (my !== hashSeq) return;
        el.textContent = toHex(buf);
      } catch (err) {
        el.textContent = 'error: ' + err.message;
      }
    }
  };
  hashIn.addEventListener('input', runHashes);

  // ---------- Timestamp ----------
  const tSec = $('time-sec');
  const tMs = $('time-ms');
  const tIso = $('time-iso');
  const tLocal = $('time-local');
  const tStatus = $('time-status');
  const tLive = $('time-live');

  let updating = false;
  const fromDate = (d) => {
    if (isNaN(d.getTime())) {
      setStatus(tStatus, 'Invalid date.', 'err');
      return;
    }
    updating = true;
    tSec.value = Math.floor(d.getTime() / 1000);
    tMs.value = d.getTime();
    tIso.value = d.toISOString();
    tLocal.value = d.toString();
    setStatus(tStatus, 'OK', 'ok');
    updating = false;
  };

  tSec.addEventListener('input', () => { if (updating) return; const n = Number(tSec.value); if (Number.isFinite(n)) fromDate(new Date(n * 1000)); });
  tMs.addEventListener('input',  () => { if (updating) return; const n = Number(tMs.value);  if (Number.isFinite(n)) fromDate(new Date(n)); });
  tIso.addEventListener('input', () => { if (updating) return; fromDate(new Date(tIso.value)); });

  document.querySelector('[data-act="time-now"]').addEventListener('click', () => fromDate(new Date()));

  const tickLive = () => {
    const d = new Date();
    tLive.textContent = `now: ${Math.floor(d.getTime() / 1000)} · ${d.toISOString()}`;
  };
  tickLive();
  setInterval(tickLive, 1000);
  fromDate(new Date());
})();
