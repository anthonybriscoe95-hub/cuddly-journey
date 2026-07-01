import logging
import smtplib
from email.mime.text import MIMEText

from flask import current_app

logger = logging.getLogger("window_agent.notifications")


def send_email(to_address: str, subject: str, body: str) -> None:
    if not to_address:
        return

    host = current_app.config["SMTP_HOST"]
    if not host:
        logger.info("[DRY RUN] Email to %s | %s\n%s", to_address, subject, body)
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = current_app.config["SMTP_FROM"] or current_app.config["SMTP_USERNAME"]
    msg["To"] = to_address

    with smtplib.SMTP(host, current_app.config["SMTP_PORT"]) as server:
        server.starttls()
        server.login(current_app.config["SMTP_USERNAME"], current_app.config["SMTP_PASSWORD"])
        server.send_message(msg)


def send_sms(to_number: str, body: str) -> None:
    if not to_number:
        return

    sid = current_app.config["TWILIO_ACCOUNT_SID"]
    if not sid:
        logger.info("[DRY RUN] SMS to %s: %s", to_number, body)
        return

    from twilio.rest import Client

    client = Client(sid, current_app.config["TWILIO_AUTH_TOKEN"])
    client.messages.create(
        to=to_number,
        from_=current_app.config["TWILIO_FROM_NUMBER"],
        body=body,
    )


def notify_owner_new_lead(lead) -> None:
    subject = f"New lead: {lead.name} ({lead.source})"
    body = (
        f"Name: {lead.name}\n"
        f"Phone: {lead.phone}\n"
        f"Email: {lead.email}\n"
        f"Address: {lead.address}\n"
        f"Windows: {lead.num_windows}, Stories: {lead.stories}\n"
        f"Quote: ${lead.quote_amount}\n"
        f"Source: {lead.source}\n"
        f"Notes: {lead.notes or '-'}\n"
    )
    send_email(current_app.config["BUSINESS_EMAIL"], subject, body)


def send_quote_confirmation(lead) -> None:
    business = current_app.config["BUSINESS_NAME"]
    subject = f"Your window cleaning quote from {business}"
    body = (
        f"Hi {lead.name},\n\n"
        f"Thanks for reaching out to {business}! Based on what you told us "
        f"({lead.num_windows} windows, {lead.stories} stor{'y' if lead.stories == 1 else 'ies'}), "
        f"your estimated quote is ${lead.quote_amount:.2f}.\n\n"
        f"Reply to this email or call {current_app.config['BUSINESS_PHONE']} to book a date.\n\n"
        f"Thanks,\n{business}"
    )
    send_email(lead.email, subject, body)
    if lead.phone:
        send_sms(
            lead.phone,
            f"Hi {lead.name}, your window cleaning quote from {business} is ${lead.quote_amount:.2f}. "
            f"Reply to book or call {current_app.config['BUSINESS_PHONE']}.",
        )


def send_follow_up(lead) -> None:
    business = current_app.config["BUSINESS_NAME"]
    subject = f"Still interested in getting your windows cleaned? - {business}"
    body = (
        f"Hi {lead.name},\n\n"
        f"Just checking in about your ${lead.quote_amount:.2f} window cleaning quote. "
        f"Let us know if you'd like to pick a date, or if you have any questions.\n\n"
        f"{business}\n{current_app.config['BUSINESS_PHONE']}"
    )
    send_email(lead.email, subject, body)
    if lead.phone:
        send_sms(
            lead.phone,
            f"Hi {lead.name}, just following up on your ${lead.quote_amount:.2f} quote from {business}. "
            f"Want to schedule? Reply here or call {current_app.config['BUSINESS_PHONE']}.",
        )


def send_appointment_reminder(job) -> None:
    lead = job.lead
    business = current_app.config["BUSINESS_NAME"]
    when = job.scheduled_at.strftime("%A %b %d at %I:%M %p")
    subject = f"Reminder: window cleaning tomorrow - {business}"
    body = (
        f"Hi {lead.name},\n\nThis is a reminder that we'll be cleaning your windows on {when}.\n\n"
        f"See you then!\n{business}\n{current_app.config['BUSINESS_PHONE']}"
    )
    send_email(lead.email, subject, body)
    if lead.phone:
        send_sms(lead.phone, f"Reminder: {business} is coming to clean your windows on {when}.")


def send_on_my_way(job) -> None:
    lead = job.lead
    business = current_app.config["BUSINESS_NAME"]
    if lead.phone:
        send_sms(lead.phone, f"Hi {lead.name}, this is {business} - we're on our way to clean your windows!")
    send_email(
        lead.email,
        f"{business} is on the way",
        f"Hi {lead.name},\n\nWe're on our way to clean your windows now.\n\n{business}",
    )
