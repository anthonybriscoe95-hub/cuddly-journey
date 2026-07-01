import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///window_agent.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")

    BUSINESS_NAME = os.environ.get("BUSINESS_NAME", "Your Window Cleaning Business")
    BUSINESS_EMAIL = os.environ.get("BUSINESS_EMAIL", "")
    BUSINESS_PHONE = os.environ.get("BUSINESS_PHONE", "")

    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM = os.environ.get("SMTP_FROM", "")

    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER", "")


# Pricing rules - tweak these to match your actual pricing.
PRICING = {
    "base_fee": 50.0,  # flat call-out fee
    "price_per_window": 6.0,  # per pane, ground level, in+out
    "story_surcharge_per_window": 2.0,  # extra per window when stories >= 2
    "screens_price_per_window": 2.0,
    "tracks_price_per_window": 1.5,
}

FOLLOW_UP_AFTER_DAYS = int(os.environ.get("FOLLOW_UP_AFTER_DAYS", "2"))
REMINDER_HOURS_BEFORE = int(os.environ.get("REMINDER_HOURS_BEFORE", "24"))
