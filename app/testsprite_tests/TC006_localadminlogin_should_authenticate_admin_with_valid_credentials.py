import requests

def test_localadminlogin_should_authenticate_admin_with_valid_credentials():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/auth.localAdminLogin"
    url = f"{base_url}{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }
    # Provide valid admin credentials payload as per API spec
    payload = {
        "email": "admin@example.com",
        "password": "password123"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check that the response contains a token or session data keys (at least one key)
    assert isinstance(json_data, dict) and len(json_data) > 0, "Response JSON is empty or invalid"

test_localadminlogin_should_authenticate_admin_with_valid_credentials()
