import requests

BASE_URL = "http://localhost:3000"

def test_post_apitrpcstoregetorderbynumber_should_return_order_status():
    headers = {"Content-Type": "application/json"}

    order_number = None

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
            timeout=30
        )
        assert place_order_response.status_code == 200, f"Place order failed: {place_order_response.text}"
        place_order_data = place_order_response.json()
        order_number = place_order_data.get("result", {}).get("data", {}).get("orderNumber")
        assert order_number is not None, "Order number not found in place order response"

        # Step 2: Use the order number to get order status
        get_order_payload = {
            "orderNumber": order_number
        }

        get_order_response = requests.post(
            f"{BASE_URL}/api/trpc/store.getOrderByNumber",
            json=get_order_payload,
            headers=headers,
            timeout=30
        )
        assert get_order_response.status_code == 200, f"Get order by number failed: {get_order_response.text}"
        get_order_data = get_order_response.json()
        order_status = get_order_data.get("result", {}).get("data", {}).get("status")
        assert order_status is not None, "Order status not found in getOrderByNumber response"

    finally:
        # Cleanup: Cancel the created order if possible
        if order_number:
            try:
                cancel_order_payload = {
                    "orderNumber": order_number
                }
                cancel_response = requests.post(
                    f"{BASE_URL}/api/trpc/store.cancelOrder",
                    json=cancel_order_payload,
                    headers=headers,
                    timeout=30
                )
            except Exception:
                pass

test_post_apitrpcstoregetorderbynumber_should_return_order_status()
