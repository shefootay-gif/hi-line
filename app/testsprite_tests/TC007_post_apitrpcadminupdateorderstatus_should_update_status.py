import requests

BASE_URL = "http://localhost:3000"

def test_post_apitrpcadminupdateorderstatus_should_update_status():
    # Step 1: Authenticate admin to get auth token or session context
    login_url = f"{BASE_URL}/api/trpc/auth.login"
    login_payload = {
        "username": "admin",
        "password": "password123"
    }
    login_headers = {
        "Content-Type": "application/json"
    }

    login_response = requests.post(login_url, json=login_payload, headers=login_headers, timeout=30)
    assert login_response.status_code == 200, f"Admin login failed with status {login_response.status_code}"

    login_json = login_response.json()
    token = None
    if isinstance(login_json, dict):
        res = login_json.get("result")
        if res and isinstance(res, dict):
            data = res.get("data")
            if isinstance(data, dict):
                token = data.get("token")
            elif isinstance(data, str):
                token = data
        if not token:
            token = login_json.get("token")
    assert token is not None, "Authentication token not found in login response"

    # Step 2: List orders to get an existing order ID to update
    list_orders_url = f"{BASE_URL}/api/trpc/admin.listOrders"
    list_orders_payload = {}
    list_orders_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    orders_response = requests.post(list_orders_url, json=list_orders_payload, headers=list_orders_headers, timeout=30)
    assert orders_response.status_code == 200, f"List orders failed with status {orders_response.status_code}"

    orders_json = orders_response.json()
    orders = []
    if isinstance(orders_json, dict):
        res = orders_json.get("result")
        if res and isinstance(res, dict):
            data = res.get("data")
            if isinstance(data, list):
                orders = data
            elif isinstance(data, dict):
                orders = data.get("orders", [])
    assert orders and len(orders) > 0, "No orders found to update"

    order_to_update = orders[0]
    order_id = order_to_update.get("id")
    current_status = order_to_update.get("status")
    assert order_id is not None, "Order id not found"

    new_status = "shipped" if current_status != "shipped" else "delivered"

    # Step 3: Update order status
    update_status_url = f"{BASE_URL}/api/trpc/admin.updateOrderStatus"
    update_status_payload = {
        "orderId": order_id,
        "status": new_status
    }
    update_status_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    update_response = requests.post(update_status_url, json=update_status_payload, headers=update_status_headers, timeout=30)
    assert update_response.status_code == 200, f"Update order status failed with status {update_response.status_code}"

    update_json = update_response.json()
    updated_order = None
    if isinstance(update_json, dict):
        res = update_json.get("result")
        if res and isinstance(res, dict):
            updated_order = res.get("data")

    assert updated_order is not None, "Updated order details missing in response"
    assert updated_order.get("id") == order_id, "Updated order ID mismatch"
    assert updated_order.get("status") == new_status, "Order status not updated properly"


test_post_apitrpcadminupdateorderstatus_should_update_status()
