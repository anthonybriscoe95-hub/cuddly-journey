"""Daily automation sweep: nudges stale leads and reminds customers of upcoming jobs.

Run this once a day (cron, Task Scheduler, or a hosting platform's scheduled job):
    python -m window_agent.tasks
"""
import logging
import sys
from datetime import datetime, timedelta

from .app import create_app
from .config import FOLLOW_UP_AFTER_DAYS, REMINDER_HOURS_BEFORE
from .models import Job, Lead, db
from .notifications import send_appointment_reminder, send_follow_up


def run_daily_sweep():
    app = create_app()
    with app.app_context():
        _send_lead_follow_ups()
        _send_appointment_reminders()


def _send_lead_follow_ups():
    cutoff = datetime.utcnow() - timedelta(days=FOLLOW_UP_AFTER_DAYS)
    stale_leads = Lead.query.filter(
        Lead.status.in_(["new", "contacted"]),
        Lead.created_at <= cutoff,
        (Lead.last_contacted_at.is_(None)) | (Lead.last_contacted_at <= cutoff),
    ).all()
    for lead in stale_leads:
        send_follow_up(lead)
        lead.status = "contacted"
        lead.last_contacted_at = datetime.utcnow()
    db.session.commit()


def _send_appointment_reminders():
    window_start = datetime.utcnow()
    window_end = window_start + timedelta(hours=REMINDER_HOURS_BEFORE)
    upcoming = Job.query.filter(
        Job.status == "scheduled",
        Job.reminder_sent_at.is_(None),
        Job.scheduled_at >= window_start,
        Job.scheduled_at <= window_end,
    ).all()
    for job in upcoming:
        send_appointment_reminder(job)
        job.reminder_sent_at = datetime.utcnow()
        job.status = "reminded"
    db.session.commit()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_daily_sweep()
    sys.exit(0)
