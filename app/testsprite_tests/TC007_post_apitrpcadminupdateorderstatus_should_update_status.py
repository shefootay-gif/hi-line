import requests
import base64

BASE_URL = "http://localhost:3000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"
TIMEOUT = 30

def get_basic_auth_header(username, password):
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

def create_order():
    # Example minimal order payload
    payload = {
        "store.placeOrder": {
            "customer": {
                "name": "Test User",
                "email": "testuser@example.com",
                "address": "123 Test St"
            },
            "cart": [
                # Placeholder product and quantity - will fetch actual product below
            ]
        }
    }
    # Fetch products to get a valid product ID
    products_resp = requests.post(f"{BASE_URL}/api/trpc/store.getProducts", json={}, timeout=TIMEOUT)
    products_resp.raise_for_status()
    products_data = products_resp.json()
    products_list = products_data.get("result", {}).get("data", [])
    if not products_list:
        raise Exception("No products available to create order")

    product = products_list[0]
    payload["store.placeOrder"]["cart"].append({
        "productId": product["id"],
        "quantity": 1
    })

    resp = requests.post(f"{BASE_URL}/api/trpc/store.placeOrder", json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    order_number = data.get("result", {}).get("data", {}).get("orderNumber")
    order_id = data.get("result", {}).get("data", {}).get("id")
    if not order_number or not order_id:
        raise Exception("Order creation failed, missing orderNumber or id")
    return order_id, order_number

def delete_order(order_id, auth_header):
    payload = {
        "admin.deleteOrder": {
            "id": order_id
        }
    }
    resp = requests.post(f"{BASE_URL}/api/trpc/admin.deleteOrder", headers=auth_header, json=payload, timeout=TIMEOUT)
    # We don't assert delete response here, just best effort cleanup

def test_post_apitrpcadminupdateorderstatus_should_update_status():
    auth_header = get_basic_auth_header(ADMIN_USERNAME, ADMIN_PASSWORD)
    order_id = None
    try:
        # Create a new order to update
        order_id, order_number = create_order()

        # Prepare update status payload - example status "SHIPPED"
        update_payload = {
            "admin.updateOrderStatus": {
                "orderId": order_id,
                "status": "SHIPPED"
            }
        }

        response = requests.post(f"{BASE_URL}/api/trpc/admin.updateOrderStatus", headers=auth_header, json=update_payload, timeout=TIMEOUT)

        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()
        assert "result" in data, "Missing result in response JSON"
        updated_order = data["result"].get("data")
        assert updated_order is not None, "Missing updated order data"
        assert updated_order.get("id") == order_id, "Updated order ID mismatch"
        assert updated_order.get("status") == "SHIPPED", f"Order status not updated to SHIPPED, got {updated_order.get('status')}"

    finally:
        if order_id is not None:
            delete_order(order_id, auth_header)

test_post_apitrpcadminupdateorderstatus_should_update_status()