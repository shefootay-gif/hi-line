import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("admin", "password123")
TIMEOUT = 30
HEADERS = {'Content-Type': 'application/json'}

def test_post_apitrpcadmindeleteorder_should_delete_order():
    # Step 1: Place a new order to get a valid existing order identifier
    place_order_url = f"{BASE_URL}/api/trpc/store.placeOrder"
    place_order_payload = {
        "customer": {
            "name": "Test User",
            "email": "testuser@example.com",
            "phone": "1234567890",
            "address": "123 Test St"
        },
        "cart": []
    }

    # We need some products to place an order, so fetch products first
    products = []
    try:
        products_resp = requests.post(f"{BASE_URL}/api/trpc/store.getProducts", headers=HEADERS, timeout=TIMEOUT)
        products_resp.raise_for_status()
        products_data = products_resp.json()
        # Attempt to get 1 product with quantity 1 if available
        if isinstance(products_data, dict) and "result" in products_data:
            result_data = products_data.get("result")
            if isinstance(result_data, dict) and "data" in result_data and isinstance(result_data["data"], list):
                products = result_data["data"]
            elif isinstance(products_data.get("result"), list):
                products = products_data["result"]
        if not products:
            raise Exception("No products found for placing order")
    except Exception as e:
        raise Exception(f"Failed to fetch products: {e}")

    # Use first product with quantity 1 for placing the order
    first_product = products[0]
    product_id = first_product.get("id") or first_product.get("productId")
    if not product_id:
        raise Exception("Product ID not found in product data")

    place_order_payload["cart"] = [{"productId": product_id, "quantity": 1}]

    order_id = None
    try:
        resp_place_order = requests.post(
            place_order_url,
            json=place_order_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        resp_place_order.raise_for_status()
        place_order_resp_json = resp_place_order.json()
        # Extract order ID or number from response
        order_id = None
        if "result" in place_order_resp_json:
            res = place_order_resp_json["result"]
            if isinstance(res, dict):
                order_id = res.get("orderId") or res.get("id") or res.get("orderNumber")
            elif isinstance(res, str):
                order_id = res
        if not order_id:
            order_id = place_order_resp_json.get("orderId") or place_order_resp_json.get("id") or place_order_resp_json.get("orderNumber")

        if not order_id:
            raise Exception("Order ID not found in placeOrder response")

        # Step 2: Delete the order via admin.deleteOrder endpoint
        delete_order_url = f"{BASE_URL}/api/trpc/admin.deleteOrder"
        delete_payload = {"orderId": order_id}

        response_delete = requests.post(
            delete_order_url,
            json=delete_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )

        assert response_delete.status_code == 200, f"Expected 200 status, got {response_delete.status_code}"

        delete_resp_json = response_delete.json()
        assert (
            "result" in delete_resp_json or "message" in delete_resp_json or "deleted" in delete_resp_json
        ), "Deletion confirmation not found in response"

    finally:
        # Cleanup: Attempt to delete the order if it still exists (ignore errors)
        if order_id:
            try:
                requests.post(
                    f"{BASE_URL}/api/trpc/admin.deleteOrder",
                    json={"orderId": order_id},
                    auth=AUTH,
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

test_post_apitrpcadmindeleteorder_should_delete_order()