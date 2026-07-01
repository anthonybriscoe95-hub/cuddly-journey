import functools
import os
from datetime import datetime

from flask import Flask, flash, redirect, render_template, request, session, url_for

from .config import Config
from .models import Job, Lead, db
from .notifications import notify_owner_new_lead, send_on_my_way, send_quote_confirmation
from .quoting import calculate_quote


def create_app(config_object=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object)

    os.makedirs(app.instance_path, exist_ok=True)
    if app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite:///") and not app.config[
        "SQLALCHEMY_DATABASE_URI"
    ].startswith("sqlite:////"):
        db_name = app.config["SQLALCHEMY_DATABASE_URI"].replace("sqlite:///", "")
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
            app.instance_path, db_name
        )

    db.init_app(app)

    with app.app_context():
        db.create_all()

    register_routes(app)
    return app


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login", next=request.path))
        return view(*args, **kwargs)

    return wrapped


def register_routes(app):
    @app.route("/", methods=["GET"])
    def quote_form():
        return render_template("quote_form.html", business=app.config["BUSINESS_NAME"])

    @app.route("/quote", methods=["POST"])
    def submit_quote():
        form = request.form
        try:
            num_windows = int(form.get("num_windows", 0))
            stories = int(form.get("stories", 1))
        except ValueError:
            flash("Please enter a valid number of windows and stories.")
            return redirect(url_for("quote_form"))

        screens = form.get("screens") == "on"
        tracks = form.get("tracks") == "on"

        try:
            amount = calculate_quote(num_windows, stories, screens, tracks)
        except ValueError as exc:
            flash(str(exc))
            return redirect(url_for("quote_form"))

        lead = Lead(
            name=form.get("name", "").strip(),
            phone=form.get("phone", "").strip(),
            email=form.get("email", "").strip(),
            address=form.get("address", "").strip(),
            source=form.get("source", "website"),
            num_windows=num_windows,
            stories=stories,
            screens=screens,
            tracks=tracks,
            notes=form.get("notes", "").strip(),
            quote_amount=amount,
            status="new",
        )
        db.session.add(lead)
        db.session.commit()

        send_quote_confirmation(lead)
        notify_owner_new_lead(lead)

        return render_template(
            "quote_result.html", lead=lead, business=app.config["BUSINESS_NAME"]
        )

    # --- Admin auth ---

    @app.route("/admin/login", methods=["GET", "POST"])
    def admin_login():
        if request.method == "POST":
            if request.form.get("password") == app.config["ADMIN_PASSWORD"]:
                session["is_admin"] = True
                return redirect(request.args.get("next") or url_for("admin_dashboard"))
            flash("Incorrect password.")
        return render_template("admin/login.html")

    @app.route("/admin/logout")
    def admin_logout():
        session.pop("is_admin", None)
        return redirect(url_for("admin_login"))

    # --- Admin dashboard ---

    @app.route("/admin")
    @login_required
    def admin_dashboard():
        leads = Lead.query.order_by(Lead.created_at.desc()).all()
        jobs = Job.query.order_by(Job.scheduled_at.asc()).all()
        return render_template("admin/dashboard.html", leads=leads, jobs=jobs)

    @app.route("/admin/leads/new", methods=["GET", "POST"])
    @login_required
    def admin_new_lead():
        if request.method == "POST":
            form = request.form
            num_windows = int(form.get("num_windows") or 0) or None
            stories = int(form.get("stories") or 1)
            amount = None
            if num_windows:
                amount = calculate_quote(
                    num_windows, stories, form.get("screens") == "on", form.get("tracks") == "on"
                )
            lead = Lead(
                name=form.get("name", "").strip(),
                phone=form.get("phone", "").strip(),
                email=form.get("email", "").strip(),
                address=form.get("address", "").strip(),
                source=form.get("source", "door_to_door"),
                num_windows=num_windows,
                stories=stories,
                notes=form.get("notes", "").strip(),
                quote_amount=amount,
                status="new",
            )
            db.session.add(lead)
            db.session.commit()
            flash("Lead added.")
            return redirect(url_for("admin_dashboard"))
        return render_template("admin/new_lead.html")

    @app.route("/admin/leads/<int:lead_id>")
    @login_required
    def admin_lead_detail(lead_id):
        lead = Lead.query.get_or_404(lead_id)
        return render_template("admin/lead_detail.html", lead=lead)

    @app.route("/admin/leads/<int:lead_id>/status", methods=["POST"])
    @login_required
    def admin_update_status(lead_id):
        lead = Lead.query.get_or_404(lead_id)
        lead.status = request.form.get("status", lead.status)
        lead.last_contacted_at = datetime.utcnow()
        db.session.commit()
        return redirect(url_for("admin_lead_detail", lead_id=lead.id))

    @app.route("/admin/leads/<int:lead_id>/schedule", methods=["POST"])
    @login_required
    def admin_schedule_job(lead_id):
        lead = Lead.query.get_or_404(lead_id)
        scheduled_at = datetime.strptime(request.form["scheduled_at"], "%Y-%m-%dT%H:%M")
        job = Job(
            lead_id=lead.id,
            scheduled_at=scheduled_at,
            price=lead.quote_amount,
            notes=request.form.get("notes", ""),
        )
        lead.status = "booked"
        db.session.add(job)
        db.session.commit()
        flash("Job scheduled.")
        return redirect(url_for("admin_lead_detail", lead_id=lead.id))

    @app.route("/admin/jobs/<int:job_id>/complete", methods=["POST"])
    @login_required
    def admin_complete_job(job_id):
        job = Job.query.get_or_404(job_id)
        job.status = "completed"
        job.lead.status = "completed"
        db.session.commit()
        return redirect(url_for("admin_dashboard"))

    @app.route("/admin/jobs/<int:job_id>/on-my-way", methods=["POST"])
    @login_required
    def admin_on_my_way(job_id):
        job = Job.query.get_or_404(job_id)
        send_on_my_way(job)
        flash("On-my-way message sent.")
        return redirect(url_for("admin_dashboard"))
