import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_apitrpcstorecancelorder_should_cancel_order():
    headers = {"Content-Type": "application/json"}

    # Step 1: Get active products
    try:
        prod_resp = requests.post(
            f"{BASE_URL}/api/trpc/store.getProducts",
            headers=headers,
            json={},  # empty payload
            timeout=TIMEOUT,
        )
        prod_resp.raise_for_status()
        products_data = prod_resp.json()
        products = products_data.get("result", {}).get("data", [])
        assert isinstance(products, list) and len(products) > 0, "No products available to order"

        first_product = products[0]
        product_id = first_product.get("id")
        assert product_id is not None, "Product ID missing"

        # Step 2: Place Order
        place_order_payload = {
            "customer": {
                "name": "Test User",
                "email": "testuser@example.com",
                "phone": "1234567890",
                "address": "123 Test St, Test City"
            },
            "cart": [
                {"productId": product_id, "quantity": 1}
            ]
        }

        place_resp = requests.post(
            f"{BASE_URL}/api/trpc/store.placeOrder",
            headers=headers,
            json=place_order_payload,
            timeout=TIMEOUT,
        )
        place_resp.raise_for_status()
        place_resp_json = place_resp.json()
        order_number = (
            place_resp_json.get("result", {})
            .get("data", {})
            .get("orderNumber")
        )
        assert order_number is not None, "Order number missing from placeOrder response"

        # Step 3: Cancel the order
        cancel_payload = {
            "orderNumber": order_number
        }

        cancel_resp = requests.post(
            f"{BASE_URL}/api/trpc/store.cancelOrder",
            headers=headers,
            json=cancel_payload,
            timeout=TIMEOUT,
        )
        cancel_resp.raise_for_status()
        cancel_resp_json = cancel_resp.json()
        cancel_data = cancel_resp_json.get("result", {}).get("data", {})

        assert cancel_data.get("orderNumber") == order_number, "Cancelled orderNumber mismatch"
        assert cancel_data.get("status") in ["cancelled", "canceled"], "Order status is not cancelled"
        assert cancel_resp.status_code == 200

    finally:
        # Cleanup: login admin and delete the order
        login_payload = {
            "username": "admin",
            "password": "password123"
        }
        try:
            login_resp = requests.post(
                f"{BASE_URL}/api/trpc/auth.login",
                headers={"Content-Type": "application/json"},
                json=login_payload,
                timeout=TIMEOUT,
            )
            if login_resp.status_code == 200:
                login_data = login_resp.json()
                token = login_data.get("result", {}).get("data", {}).get("token")
                if token and 'order_number' in locals():
                    delete_order_payload = {
                        "orderId": order_number
                    }
                    delete_headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}"
                    }
                    requests.post(
                        f"{BASE_URL}/api/trpc/admin.deleteOrder",
                        headers=delete_headers,
                        json=delete_order_payload,
                        timeout=TIMEOUT,
                    )
        except Exception:
            pass


test_post_apitrpcstorecancelorder_should_cancel_order()
