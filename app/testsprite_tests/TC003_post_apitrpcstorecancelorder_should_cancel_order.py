import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin", "password123")

def test_post_apitrpcstorecancelorder_should_cancel_order():
    headers = {"Content-Type": "application/json"}

    order_number = None

    # Step 1: Place a new order to get a valid order number
    place_order_payload = {
        "method": "store.placeOrder",
        "params": [
            {
                "customer": {
                    "name": "Test User",
                    "email": "testuser@example.com",
                    "phone": "1234567890",
                    "address": "123 Test St"
                },
                "cart": [
                    # We will first get products to get valid productId and quantity
                ]
            }
        ]
    }

    try:
        # Get products to select a product for order
        get_products_payload = {
            "method": "store.getProducts",
            "params": [{}]
        }
        resp_products = requests.post(
            f"{BASE_URL}/api/trpc/store.getProducts",
            json=get_products_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_products.status_code == 200
        data_products = resp_products.json()
        products = data_products.get("result", {}).get("data", [])
        assert isinstance(products, list) and len(products) > 0
        # Pick first available product with stock > 0
        selected_product = None
        for p in products:
            if p.get("stock", 0) > 0 and "id" in p:
                selected_product = p
                break
        assert selected_product is not None, "No product with stock available to place order"

        place_order_payload["params"][0]["cart"] = [
            {"productId": selected_product["id"], "quantity": 1}
        ]

        resp_place_order = requests.post(
            f"{BASE_URL}/api/trpc/store.placeOrder",
            json=place_order_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_place_order.status_code == 200
        data_place_order = resp_place_order.json()
        order_number = data_place_order.get("result", {}).get("data", {}).get("orderNumber")
        assert order_number, "Order number not found in placeOrder response"

        # Step 2: Cancel the order using the order number
        cancel_order_payload = {
            "method": "store.cancelOrder",
            "params": [
                {
                    "orderNumber": order_number
                }
            ]
        }
        resp_cancel_order = requests.post(
            f"{BASE_URL}/api/trpc/store.cancelOrder",
            json=cancel_order_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_cancel_order.status_code == 200
        data_cancel_order = resp_cancel_order.json()
        # Assert presence of result.data to confirm cancellation
        assert "result" in data_cancel_order and "data" in data_cancel_order["result"] and data_cancel_order["result"]["data"], \
            f"Cancellation confirmation not found in response: {data_cancel_order}"

    finally:
        # Clean up: Try to delete the test order via admin API if possible
        # Authenticate as admin
        auth_payload = {
            "method": "auth.login",
            "params": [
                {
                    "username": "admin",
                    "password": "password123"
                }
            ]
        }
        try:
            resp_auth = requests.post(
                f"{BASE_URL}/api/trpc/auth.login",
                json=auth_payload,
                headers=headers,
                timeout=TIMEOUT
            )
            if resp_auth.status_code == 200:
                token = resp_auth.json().get("result", {}).get("data", {}).get("token")
                if token and order_number:
                    delete_order_payload = {
                        "method": "admin.deleteOrder",
                        "params": [
                            {
                                "orderNumber": order_number
                            }
                        ]
                    }
                    delete_headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}"
                    }
                    requests.post(
                        f"{BASE_URL}/api/trpc/admin.deleteOrder",
                        json=delete_order_payload,
                        headers=delete_headers,
                        timeout=TIMEOUT
                    )
        except Exception:
            pass

test_post_apitrpcstorecancelorder_should_cancel_order()
