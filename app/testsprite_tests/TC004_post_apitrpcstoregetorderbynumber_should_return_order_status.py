import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin", "password123")

def test_post_apitrpcstoregetorderbynumber_should_return_order_status():
    order_number = None
    headers = {
        "Content-Type": "application/json"
    }

    try:
        # Step 1: Place a new order to get a valid order number
        place_order_payload = {
            "customer": {
                "name": "Test Customer",
                "email": "testcustomer@example.com",
                "phone": "1234567890",
                "address": "123 Test St, Test City"
            },
            "cart": [
                {
                    "productId": 1,
                    "quantity": 1
                }
            ]
        }
        place_order_response = requests.post(
            f"{BASE_URL}/api/trpc/store.placeOrder",
            json=place_order_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert place_order_response.status_code == 200, f"Place order failed: {place_order_response.text}"
        place_order_data = place_order_response.json()
        order_number = None
        if "result" in place_order_data and "data" in place_order_data["result"]:
            order_result_data = place_order_data["result"]["data"]
            if isinstance(order_result_data, dict):
                if "orderNumber" in order_result_data:
                    order_number = order_result_data["orderNumber"]
                elif "order" in order_result_data and "orderNumber" in order_result_data["order"]:
                    order_number = order_result_data["order"]["orderNumber"]
        assert order_number is not None, "Order number not found in placeOrder response"

        # Step 2: Call store.getOrderByNumber with the valid order number
        get_order_payload = {
            "orderNumber": order_number
        }
        get_order_response = requests.post(
            f"{BASE_URL}/api/trpc/store.getOrderByNumber",
            json=get_order_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_order_response.status_code == 200, f"store.getOrderByNumber failed: {get_order_response.text}"
        get_order_data = get_order_response.json()
        order_status = None
        if "result" in get_order_data and "data" in get_order_data["result"]:
            order_data = get_order_data["result"]["data"]
            if isinstance(order_data, dict):
                if "status" in order_data:
                    order_status = order_data["status"]
                elif "order" in order_data and "status" in order_data["order"]:
                    order_status = order_data["order"]["status"]

        assert order_status is not None, "Order status not found in getOrderByNumber response"

    finally:
        if order_number:
            delete_order_payload = {
                "orderId": order_number
            }
            try:
                requests.post(
                    f"{BASE_URL}/api/trpc/admin.deleteOrder",
                    json=delete_order_payload,
                    headers=headers,
                    auth=AUTH,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_post_apitrpcstoregetorderbynumber_should_return_order_status()
