import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

AUTH = requests.auth.HTTPBasicAuth("admin", "password123")

def test_post_apitrpcstoreplaceorder_should_create_new_order():
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "method": "store.placeOrder",
        "params": {
            "customer": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "1234567890",
                "address": "123 Test St, Test City, TX 78901"
            },
            "cart": [
                {
                    "id": 1,
                    "quantity": 2
                },
                {
                    "id": 2,
                    "quantity": 1
                }
            ]
        }
    }
    order_number = None
    try:
        response = requests.post(
            f"{BASE_URL}/api/trpc/store.placeOrder",
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        resp_json = response.json()
        # Check that response has order number
        assert "result" in resp_json, "Response missing 'result'"
        result = resp_json["result"]

        assert "orderNumber" in result, "Missing 'orderNumber' in response result"
        order_number = result["orderNumber"]
        assert isinstance(order_number, (str, int)) and order_number, "'orderNumber' is empty or invalid"

    finally:
        # Clean up: delete the created order if order_number is obtained
        if order_number:
            delete_payload = {
                "method": "admin.deleteOrder",
                "params": {
                    "orderId": order_number
                }
            }
            try:
                delete_response = requests.post(
                    f"{BASE_URL}/api/trpc/admin.deleteOrder",
                    json=delete_payload,
                    headers=headers,
                    auth=AUTH,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_post_apitrpcstoreplaceorder_should_create_new_order()
