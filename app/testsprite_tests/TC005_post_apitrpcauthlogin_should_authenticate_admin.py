import requests

def test_post_apitrpcauthlogin_should_authenticate_admin():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/trpc/auth.login"
    headers = {
        "Content-Type": "application/json"
    }
    # Provide correct payload with admin credentials as per typical login
    payload = {"username": "admin", "password": "password123"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"

        json_response = response.json()
        # Validate that authentication token or session context is present
        assert any(key in json_response for key in ['token', 'accessToken', 'session', 'authToken', 'context']), "Authentication token or session context not found in response"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_apitrpcauthlogin_should_authenticate_admin()