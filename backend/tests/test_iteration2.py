"""Backend tests for ReportBridge iteration 2 - onboarding, password validation, ObjectId validation"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

DEMO_EMAIL = "demo@reportbridge.io"
DEMO_PASS = "demo1234"
TEST_EMAIL = f"TEST_iter2_{int(time.time())}@test.com"
TEST_PASS = "password123"
TEST_NAME = "Test Iter2 User"


@pytest.fixture(scope="module")
def demo_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
    assert r.status_code == 200
    return s


class TestRegistrationOnboarding:
    """Test new user registration with demo seeding"""
    demo_report_id = None

    def test_register_new_user_returns_demo_report_id(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL, "name": TEST_NAME, "password": TEST_PASS
        })
        assert r.status_code == 200, f"Register failed: {r.text}"
        data = r.json()
        assert "demo_report_id" in data, "demo_report_id not returned on registration"
        assert data["demo_report_id"], "demo_report_id is empty"
        TestRegistrationOnboarding.demo_report_id = data["demo_report_id"]
        print(f"demo_report_id: {data['demo_report_id']}")

    def test_demo_report_accessible(self):
        rid = TestRegistrationOnboarding.demo_report_id
        if not rid:
            pytest.skip("No demo_report_id from registration")
        s = requests.Session()
        s.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
        r = s.get(f"{BASE_URL}/api/reports/{rid}", )
        assert r.status_code == 200, f"Demo report not accessible: {r.text}"
        data = r.json()
        assert data.get("is_demo") == True, "Report is not marked as demo"
        assert data.get("kpi_data"), "KPI data missing"
        assert data.get("chart_data"), "Chart data missing"
        print(f"Demo report: {data.get('name')}, KPIs: {data.get('kpi_data')}")

    def test_demo_kpi_values_not_nan(self):
        rid = TestRegistrationOnboarding.demo_report_id
        if not rid:
            pytest.skip("No demo_report_id")
        s = requests.Session()
        s.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
        r = s.get(f"{BASE_URL}/api/reports/{rid}")
        assert r.status_code == 200
        kpi = r.json().get("kpi_data", {})
        for key in ["total_spend", "total_leads", "total_revenue", "cpl", "roas"]:
            assert key in kpi, f"Missing KPI key: {key}"
            val = kpi[key]
            assert val is not None, f"{key} is None"
            assert isinstance(val, (int, float)), f"{key} is not a number: {val}"
            print(f"KPI {key}: {val}")


class TestPasswordValidation:
    """Test server-side password validation"""

    def test_short_password_returns_400(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "TEST_shortpw@test.com", "name": "Short PW", "password": "abc"
        })
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
        data = r.json()
        assert "6" in str(data).lower() or "password" in str(data).lower(), \
            f"Error message doesn't mention password/6 chars: {data}"

    def test_exactly_6_chars_password_succeeds(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_pw6_{int(time.time())}@test.com", "name": "PW6 User", "password": "abc123"
        })
        assert r.status_code == 200, f"6-char password failed: {r.text}"


class TestObjectIdValidation:
    """Test _validate_oid returns 400 not 500"""

    def test_invalid_objectid_returns_400(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/reports/not-a-valid-id")
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
        data = r.json()
        assert "invalid" in str(data).lower() or "id" in str(data).lower(), \
            f"Error message unexpected: {data}"

    def test_invalid_client_objectid_returns_400(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/clients/not-a-valid-id/reports")
        assert r.status_code in [400, 404], f"Expected 400 or 404, got {r.status_code}: {r.text}"

    def test_valid_but_nonexistent_id_returns_404(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/reports/000000000000000000000000")
        assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text}"


class TestDemoUserDashboard:
    """Test demo user dashboard"""

    def test_demo_user_has_reports(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
        assert r.status_code == 200
        r2 = s.get(f"{BASE_URL}/api/reports")
        assert r2.status_code == 200
        reports = r2.json()
        assert isinstance(reports, list)
        assert len(reports) > 0, "Demo user has no reports"
        print(f"Demo user has {len(reports)} reports")
