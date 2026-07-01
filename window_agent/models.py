from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

LEAD_STATUSES = ["new", "contacted", "booked", "declined", "completed"]
LEAD_SOURCES = ["website", "google_ad", "door_to_door", "referral"]


class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30))
    email = db.Column(db.String(120))
    address = db.Column(db.String(255))
    source = db.Column(db.String(50), default="website")
    num_windows = db.Column(db.Integer)
    stories = db.Column(db.Integer, default=1)
    screens = db.Column(db.Boolean, default=False)
    tracks = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    quote_amount = db.Column(db.Float)
    status = db.Column(db.String(20), default="new")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_contacted_at = db.Column(db.DateTime)

    jobs = db.relationship("Job", backref="lead", cascade="all, delete-orphan")


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey("lead.id"), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float)
    status = db.Column(db.String(20), default="scheduled")
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reminder_sent_at = db.Column(db.DateTime)
