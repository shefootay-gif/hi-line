import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds


def test_listorders_should_return_orders_for_authenticated_admin():
    login_url = f"{BASE_URL}/api/trpc/auth.localAdminLogin"
    orders_url = f"{BASE_URL}/api/trpc/admin.listOrders"

    # Step 1: Login to get auth token
    login_payload = {"email": "admin", "password": "password123"}
    login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_response.status_code == 200, f"Expected 200 OK when logging in, got {login_response.status_code}"

    try:
        login_data = login_response.json()
    except Exception as e:
        raise AssertionError(f"Login response is not valid JSON: {e}")

    # Expecting token or session data from login response
    assert "token" in login_data or "accessToken" in login_data or "session" in login_data, "Expected token or session in login response"

    # Extract token (try 'token' or 'accessToken' or fallback)
    token = login_data.get("token") or login_data.get("accessToken") or None
    if token is None and "session" in login_data and "token" in login_data["session"]:
        token = login_data["session"]["token"]
    assert token is not None, "Authentication token not found in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # Test unauthorized access - no authentication
    response_unauth = requests.get(orders_url, timeout=TIMEOUT)
    assert response_unauth.status_code == 401, f"Expected 401 unauthorized when no auth, got {response_unauth.status_code}"

    # Test authorized access with Bearer token
    response_auth = requests.get(orders_url, headers=headers, timeout=TIMEOUT)
    assert response_auth.status_code == 200, f"Expected 200 OK with auth, got {response_auth.status_code}"

    # The response JSON should be an array (list) of orders
    try:
        data = response_auth.json()
    except Exception as e:
        raise AssertionError(f"Response is not valid JSON: {e}")

    assert isinstance(data, list), f"Expected response to be a list (array) of orders, but got {type(data)}"


test_listorders_should_return_orders_for_authenticated_admin()
