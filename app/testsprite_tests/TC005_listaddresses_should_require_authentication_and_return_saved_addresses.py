import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_listaddresses_should_require_authentication_and_return_saved_addresses():
    url = f"{BASE_URL}/api/trpc/store.listAddresses"

    # Test case 1: Call without authentication - expect 401 Unauthorized
    try:
        response_unauth = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request without auth failed with exception: {e}"
    assert response_unauth.status_code == 401, f"Expected 401 Unauthorized without auth but got {response_unauth.status_code}"

    # Test case 2: Call with valid basic auth token - expect 200 and a list of saved addresses
    auth = HTTPBasicAuth("admin", "password123")
    headers = {
        "Accept": "application/json"
    }
    try:
        response_auth = requests.get(url, auth=auth, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with auth failed with exception: {e}"

    assert response_auth.status_code == 200, f"Expected 200 OK with auth but got {response_auth.status_code}"
    try:
        addresses = response_auth.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(addresses, list), f"Expected response to be a list of addresses but got {type(addresses)}"

test_listaddresses_should_require_authentication_and_return_saved_addresses()