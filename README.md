# Window Cleaning Business Agent

A small self-hosted system that replaces spreadsheet/paper lead tracking with:

- A public **quote request form** customers fill out (embed it in your site or
  link to it from ads/business cards).
- Automatic **quote calculation** and a confirmation email/text to the customer,
  plus a notification to you.
- An **admin dashboard** (password protected) to manually log door-to-door and
  referral leads, update lead status, and schedule jobs.
- A daily background sweep that **follows up with leads** who haven't booked
  and **reminds customers** of upcoming appointments.
- A one-click **"on my way"** text/email you can send before a job.

Nothing here uses paid AI/LLM APIs — it's rule-based automation, so it's free
to run and predictable. Email/SMS sending is optional: if you don't configure
SMTP or Twilio credentials, messages are logged instead of sent ("dry run"),
so you can try it out before wiring up real delivery.

## How the pieces map to your business

| Lead source | How it flows in |
|---|---|
| Your website (harborglasswindowcleaning.com) | Link a "Get a Quote" button to the `/` form, or embed it in an iframe |
| Google/Facebook ads | Point the ad's landing page at the `/` form URL |
| Door-to-door / referrals | Add them yourself from `/admin/leads/new` right after the conversation |

Every lead — regardless of source — lands in the same dashboard and gets the
same automated follow-up and reminder treatment.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit .env with your business info
python wsgi.py
```

Visit `http://127.0.0.1:5000/` for the public quote form and
`http://127.0.0.1:5000/admin` for the dashboard (password from `ADMIN_PASSWORD`
in `.env`).

### Configuring pricing

Edit the `PRICING` dict in `window_agent/config.py` to match your real rates
(base call-out fee, price per window, per-story surcharge, screens, tracks).

### Configuring email/SMS

- **Email**: fill in `SMTP_HOST`/`SMTP_USERNAME`/`SMTP_PASSWORD`/`SMTP_FROM` in
  `.env`. A Gmail account with an
  [app password](https://myaccount.google.com/apppasswords) works for `SMTP_HOST=smtp.gmail.com`.
- **SMS**: sign up for [Twilio](https://www.twilio.com/), buy a number, and
  fill in `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`.

Leave either blank to keep running in dry-run/log-only mode.

### Running the daily automation

The follow-up/reminder sweep is a script, not a background process — run it
once a day via cron:

```
0 8 * * * cd /path/to/cuddly-journey && /path/to/.venv/bin/python -m window_agent.tasks >> sweep.log 2>&1
```

`FOLLOW_UP_AFTER_DAYS` and `REMINDER_HOURS_BEFORE` in `.env` control the
timing.

## Deployment

This is a normal Flask app, so it runs on any host that supports Python:
Render, Railway, PythonAnywhere, a small VPS, or a home server. Use a
production WSGI server (e.g. `gunicorn wsgi:app`) rather than `python wsgi.py`
in production, and set `DATABASE_URL` if you want a database other than the
default SQLite file. Whatever you choose, make sure the daily sweep (above)
runs on that same host/schedule.

## Tests

```bash
pip install -r requirements.txt
pytest
```
