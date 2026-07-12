import requests

def test_post_apitrpcadminlistorders_should_return_orders_with_auth():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/api/trpc/auth.login"
    list_orders_url = f"{base_url}/api/trpc/admin.listOrders"
    timeout = 30

    # Admin credentials
    username = "admin"
    password = "password123"

    try:
        # Step 1: Authenticate admin to get auth token/session context
        login_body = {
            "method": "auth.login",
            "params": {
                "username": username,
                "password": password
            }
        }

        response = requests.post(login_url, json=login_body, timeout=timeout)
        response.raise_for_status()
        data = response.json()

        # Validate login success and get token or session context
        assert response.status_code == 200, f"Expected 200 status for login, got {response.status_code}"
        assert "result" in data, "Login response missing 'result' key"

        result = data["result"]
        # Token or session key could vary, check for 'token' or 'session'
        token = result.get("token") or result.get("session")
        assert token, "Authentication token/session missing in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 2: Call the protected admin.listOrders endpoint with Bearer token
        list_orders_body = {
            "method": "admin.listOrders",
            "params": {}
        }

        list_orders_response = requests.post(
            list_orders_url,
            json=list_orders_body,
            timeout=timeout,
            headers=headers
        )
        list_orders_response.raise_for_status()
        list_orders_data = list_orders_response.json()

        # Assertions
        assert list_orders_response.status_code == 200, f"Expected 200 status, got {list_orders_response.status_code}"
        assert "result" in list_orders_data, "Response JSON missing 'result' key"

        orders = list_orders_data["result"]
        assert isinstance(orders, list), f"Expected 'result' to be a list, got {type(orders)}"

    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_post_apitrpcadminlistorders_should_return_orders_with_auth()
