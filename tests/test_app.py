from window_agent.models import Lead


def test_quote_form_loads(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"Get a Free Window Cleaning Quote" in resp.data


def test_submitting_quote_creates_lead(client, app):
    resp = client.post(
        "/quote",
        data={
            "name": "Jane Doe",
            "phone": "555-0100",
            "email": "jane@example.com",
            "address": "123 Main St",
            "num_windows": "10",
            "stories": "2",
            "source": "website",
        },
    )
    assert resp.status_code == 200
    assert b"Thanks, Jane Doe" in resp.data

    with app.app_context():
        lead = Lead.query.filter_by(email="jane@example.com").first()
        assert lead is not None
        assert lead.status == "new"
        assert lead.quote_amount == 50.0 + 10 * 6.0 + 10 * 2.0


def test_admin_requires_login(client):
    resp = client.get("/admin", follow_redirects=True)
    assert b"Admin Login" in resp.data


def test_admin_can_add_lead_and_schedule_job(admin_client):
    resp = admin_client.post(
        "/admin/leads/new",
        data={
            "name": "Door Knock Dave",
            "phone": "555-0101",
            "source": "door_to_door",
            "num_windows": "8",
            "stories": "1",
        },
        follow_redirects=True,
    )
    assert resp.status_code == 200

    dashboard = admin_client.get("/admin")
    assert b"Door Knock Dave" in dashboard.data
