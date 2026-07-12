import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin", "password123")

def test_post_apitrpcadmindeleteorder_should_delete_order():
    headers = {
        "Content-Type": "application/json"
    }

    # Step 1: Create a new order to ensure an existing order to delete
    order_payload = {
        "method": "store.placeOrder",
        "params": {
            "customer": {
                "name": "Test User",
                "email": "testuser@example.com",
                "phone": "1234567890",
                "address": "123 Test St, Test City"
            },
            "cart": [
                # The product ID and quantity must reflect actual product data.
                # Since we do not have product info here, attempt to get from products API
            ]
        }
    }
    order_id = None
    try:
        # Fetch products to get a valid productId for placing order
        get_products_payload = {"method": "store.getProducts", "params": {}}
        resp = requests.post(f"{BASE_URL}/api/trpc/store.getProducts", json=get_products_payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to fetch products: {resp.text}"
        products_data = resp.json()
        # product list may be in result field depending on API, try to extract
        products = products_data.get("result", {}).get("data", [])
        assert isinstance(products, list) and len(products) > 0, "No products available to create order."
        product_id = products[0].get("id")
        assert product_id is not None, "Product ID not found in product data."

        # Prepare order payload with valid product info
        order_payload["params"]["cart"] = [{"productId": product_id, "quantity": 1}]

        # Place order
        order_resp = requests.post(f"{BASE_URL}/api/trpc/store.placeOrder", json=order_payload, timeout=TIMEOUT)
        assert order_resp.status_code == 200, f"Failed to place order: {order_resp.text}"
        order_resp_json = order_resp.json()
        # Extract order ID from response data
        order_id = order_resp_json.get("result", {}).get("data", {}).get("orderId")
        if order_id is None:
            # If orderId is not present, try 'id' as fallback
            order_id = order_resp_json.get("result", {}).get("data", {}).get("id")
        assert order_id is not None, "Order ID not found in placeOrder response."

        # Step 2: Authenticate admin (though basic auth is used, login endpoint exists, but instructions say basic token)
        # So here we assume AUTH is sufficient without JWT token
        # Step 3: Delete created order
        delete_payload = {
            "method": "admin.deleteOrder",
            "params": {
                "orderId": order_id
            }
        }
        delete_resp = requests.post(f"{BASE_URL}/api/trpc/admin.deleteOrder", json=delete_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 200, f"Delete order failed: {delete_resp.text}"

        delete_resp_json = delete_resp.json()
        # Check deletion confirmation - look for success indication in response
        deletion_confirmed = False
        # Common pattern: check result field or success flag or message in response body
        if "result" in delete_resp_json and "data" in delete_resp_json["result"]:
            data = delete_resp_json["result"]["data"]
            if isinstance(data, dict) and ("deleted" in data or "success" in data):
                # Detect any affirmative field
                if data.get("deleted") is True or data.get("success") is True:
                    deletion_confirmed = True
            elif isinstance(data, str):
                # If string message contains 'deleted'
                if "deleted" in data.lower():
                    deletion_confirmed = True
        if not deletion_confirmed:
            # As fallback, consider HTTP 200 as success, assert presence of any success message
            assert "delete" in delete_resp.text.lower() or "success" in delete_resp.text.lower(), "Deletion confirmation not found in response."

    finally:
        # Cleanup: Try to delete order if it still exists (for safety in case delete above failed)
        if order_id is not None:
            try:
                cleanup_payload = {
                    "method": "admin.deleteOrder",
                    "params": {
                        "orderId": order_id
                    }
                }
                requests.post(f"{BASE_URL}/api/trpc/admin.deleteOrder", json=cleanup_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_post_apitrpcadmindeleteorder_should_delete_order()
