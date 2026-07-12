import requests
from requests.auth import HTTPBasicAuth

def test_deleteorder_should_return_error_for_nonexistent_order_id():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/admin.deleteOrder"
    url = base_url + endpoint

    auth = HTTPBasicAuth("admin", "password123")

    payload = {
        "json": {
            "method": "admin.deleteOrder",
            "params": {
                "input": {
                    "orderId": "nonexistent-order-id-1234567890"
                }
            }
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            url,
            json={
                "method": "admin.deleteOrder",
                "params": {
                    "input": {
                        "orderId": "nonexistent-order-id-1234567890"
                    }
                }
            },
            auth=auth,
            headers=headers,
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # The API is expected to return a 4xx code indicating not found or error for nonexistent ID
    assert 400 <= response.status_code < 500, \
        f"Expected 4xx error status code, got {response.status_code}"

    # The response should contain indication of an error, verifying at least presence of 'error' key or message
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # tRPC responses often include 'error' key in JSON for failures
    assert "error" in data or ("result" in data and data["result"] is None), \
        "Expected error details in response JSON indicating not found order"

test_deleteorder_should_return_error_for_nonexistent_order_id()