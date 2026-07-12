import requests

def test_post_apitrpcadminlistorders_should_return_orders_with_auth():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/api/trpc/auth.login"
    list_orders_url = f"{base_url}/api/trpc/admin.listOrders"
    timeout = 30

    # Admin credentials
    username = "admin"
    password = "password123"

    # Correct tRPC login payload using method name and params
    login_payload = {
        "method": "auth.login",
        "params": [{"username": username, "password": password}]
    }

    try:
        login_response = requests.post(
            login_url,
            json=login_payload,
            timeout=timeout
        )
        assert login_response.status_code == 200, f"Admin login failed with status code {login_response.status_code}"
        json_login_resp = login_response.json()
        assert isinstance(json_login_resp, dict)

        # Extract token from tRPC result structure, typically:
        # { "result": { "data": { "token": "..." } } }
        token = None
        if 'result' in json_login_resp:
            token = json_login_resp['result'].get('data', {}).get('token')
        if not token:
            token = json_login_resp.get('token')
        assert token is not None, "Login response does not contain auth token"
    except requests.RequestException as e:
        assert False, f"Request exception during admin login: {e}"
    except AssertionError as e:
        raise e

    list_orders_payload = {
        "method": "admin.listOrders",
        "params": [{}]
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.post(
            list_orders_url,
            json=list_orders_payload,
            headers=headers,
            timeout=timeout
        )
        assert response.status_code == 200, f"Expected 200 status code, got {response.status_code}"

        resp_json = response.json()
        assert isinstance(resp_json, dict), "Response is not a JSON object"
        orders_found = False
        for v in resp_json.values():
            if isinstance(v, list):
                orders_found = True
                break
        assert orders_found, "Response JSON does not contain a list of orders"

    except requests.RequestException as e:
        assert False, f"Request exception during admin.listOrders: {e}"
    except AssertionError as e:
        raise e


test_post_apitrpcadminlistorders_should_return_orders_with_auth()
