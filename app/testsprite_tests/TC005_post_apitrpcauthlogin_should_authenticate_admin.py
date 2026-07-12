import requests

def test_post_apitrpcauthlogin_should_authenticate_admin():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/auth.login"
    url = base_url + endpoint

    headers = {
        "Content-Type": "application/json"
    }

    # Payload must have an 'input' field containing the actual login data as per tRPC interface
    payload = {
        "input": {
            "username": "admin",
            "password": "password123"
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        json_resp = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    token_keys = ['token', 'authToken', 'session', 'accessToken']
    assert any(key in json_resp for key in token_keys), f"Response JSON does not contain authentication token or session context keys {token_keys}"

test_post_apitrpcauthlogin_should_authenticate_admin()