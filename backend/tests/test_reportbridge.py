"""Backend tests for ReportBridge - auth, clients, reports, templates"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

DEMO_EMAIL = "demo@reportbridge.io"
DEMO_PASS = "demo1234"
ADMIN_EMAIL = "admin@reportbridge.io"
ADMIN_PASS = "admin123"


@pytest.fixture(scope="module")
def demo_session():
    """Authenticated session as demo user"""
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
    assert r.status_code == 200, f"Demo login failed: {r.text}"
    return s


# ── Health ──────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ── Auth ─────────────────────────────────────────────────────────────────────
class TestAuth:
    def test_login_demo(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == DEMO_EMAIL

    def test_login_admin(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_login_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_authenticated(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_logout(self):
        s = requests.Session()
        s.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
        r = s.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200

    def test_register_new_user(self):
        import time
        ts = int(time.time())
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": f"TEST_user_{ts}@test.com", "name": "Test User", "password": "test1234"})
        assert r.status_code == 200
        data = r.json()
        assert "email" in data

    def test_register_duplicate_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": DEMO_EMAIL, "name": "Dup", "password": "test1234"})
        assert r.status_code == 400


# ── Clients ──────────────────────────────────────────────────────────────────
class TestClients:
    def test_list_clients(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/clients")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        names = [c["name"] for c in data]
        assert "Acme Digital" in names
        assert "Bloom Retail" in names

    def test_create_client(self, demo_session):
        r = demo_session.post(f"{BASE_URL}/api/clients", json={"name": "TEST_Agency", "industry": "Agency"})
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Agency"
        assert "id" in data
        # Cleanup
        demo_session.delete(f"{BASE_URL}/api/clients/{data['id']}")

    def test_unauthenticated_clients(self):
        r = requests.get(f"{BASE_URL}/api/clients")
        assert r.status_code == 401


# ── Reports ──────────────────────────────────────────────────────────────────
class TestReports:
    def test_list_reports(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/reports")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        complete = [rep for rep in data if rep["status"] == "complete"]
        assert len(complete) >= 2

    def test_reports_have_kpi_data(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/reports")
        data = r.json()
        complete = [rep for rep in data if rep["status"] == "complete"]
        kpi = complete[0]["kpi_data"]
        assert "total_spend" in kpi
        assert "total_leads" in kpi
        assert "total_revenue" in kpi
        assert "cpl" in kpi
        assert "roas" in kpi

    def test_get_single_report(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/reports")
        rid = r.json()[0]["id"]
        r2 = demo_session.get(f"{BASE_URL}/api/reports/{rid}")
        assert r2.status_code == 200
        assert r2.json()["id"] == rid

    def test_create_report(self, demo_session):
        # Get a client
        clients = demo_session.get(f"{BASE_URL}/api/clients").json()
        cid = clients[0]["id"]
        r = demo_session.post(f"{BASE_URL}/api/reports", json={"client_id": cid, "name": "TEST_Report"})
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Report"
        rid = data["id"]
        # Cleanup
        demo_session.delete(f"{BASE_URL}/api/reports/{rid}")

    def test_csv_upload(self, demo_session):
        clients = demo_session.get(f"{BASE_URL}/api/clients").json()
        cid = clients[0]["id"]
        rep = demo_session.post(f"{BASE_URL}/api/reports", json={"client_id": cid, "name": "TEST_CSV_Report"}).json()
        rid = rep["id"]
        csv_content = b"date,spend,leads,revenue\n2024-01-01,1000,50,5000\n2024-01-02,1200,60,6000\n"
        r = demo_session.post(f"{BASE_URL}/api/reports/{rid}/upload-csv", files={"files": ("test.csv", io.BytesIO(csv_content), "text/csv")})
        assert r.status_code == 200
        data = r.json()
        assert len(data["csv_files"]) == 1
        assert data["csv_files"][0]["row_count"] == 2
        # Cleanup
        demo_session.delete(f"{BASE_URL}/api/reports/{rid}")

    def test_map_columns_and_generate(self, demo_session):
        clients = demo_session.get(f"{BASE_URL}/api/clients").json()
        cid = clients[0]["id"]
        rep = demo_session.post(f"{BASE_URL}/api/reports", json={"client_id": cid, "name": "TEST_Generate"}).json()
        rid = rep["id"]
        csv_content = b"date,spend,leads,revenue\n2024-01-01,1000,50,5000\n2024-01-02,1200,60,6000\n"
        demo_session.post(f"{BASE_URL}/api/reports/{rid}/upload-csv", files={"files": ("test.csv", io.BytesIO(csv_content), "text/csv")})
        demo_session.post(f"{BASE_URL}/api/reports/{rid}/map-columns", json={"mapping": {"date": "date", "spend": "spend", "leads": "leads", "revenue": "revenue"}})
        r = demo_session.post(f"{BASE_URL}/api/reports/{rid}/generate")
        assert r.status_code == 200
        data = r.json()
        assert data["kpi_data"]["total_spend"] == 2200
        assert data["kpi_data"]["total_leads"] == 110
        # Cleanup
        demo_session.delete(f"{BASE_URL}/api/reports/{rid}")


# ── Templates ────────────────────────────────────────────────────────────────
class TestTemplates:
    def test_list_templates(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/templates")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_and_delete_template(self, demo_session):
        r = demo_session.post(f"{BASE_URL}/api/templates", json={"name": "TEST_Template", "column_mapping": {"date": "Date", "spend": "Spend"}})
        assert r.status_code == 200
        tid = r.json()["id"]
        r2 = demo_session.delete(f"{BASE_URL}/api/templates/{tid}")
        assert r2.status_code == 200
