import requests
import base64

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_USERNAME = "admin"
AUTH_PASSWORD = "password123"

def get_basic_auth_header(username, password):
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

def create_order():
    url = f"{BASE_URL}/api/trpc/store.createOrder"
    payload = {
        "customerName": "Test User",
        "customerPhone": "1234567890",
        "customerEmail": "test.user@example.com",
        "shippingAddress": "123 Test Street, Test City",
        "governorate": "Test Governorate",
        "items": [
            {
                "productId": 1,
                "quantity": 1
            }
        ]
    }
    headers = {"Content-Type": "application/json"}
    # Wrap payload under 'input' key as required by tRPC
    body = {"input": payload}
    response = requests.post(url, headers=headers, json=body, timeout=TIMEOUT)
    response.raise_for_status()
    data = response.json()
    order_id = data.get("result", {}).get("id") if isinstance(data, dict) else None
    assert order_id is not None, "Failed to get order ID from createOrder response"
    return order_id

def delete_order(order_id, headers):
    url = f"{BASE_URL}/api/trpc/admin.deleteOrder"
    payload = {"id": order_id}
    body = {"input": payload}
    resp = requests.post(url, headers=headers, json=body, timeout=TIMEOUT)
    try:
        resp.raise_for_status()
    except Exception:
        pass

def list_orders(headers):
    url = f"{BASE_URL}/api/trpc/admin.listOrders"
    response = requests.get(url, headers=headers, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json().get("result")

def update_order_status_test():
    auth_headers = get_basic_auth_header(AUTH_USERNAME, AUTH_PASSWORD)
    order_id = create_order()
    assert order_id is not None, "Failed to create order for update test"
    try:
        update_url = f"{BASE_URL}/api/trpc/admin.updateOrderStatus"
        new_status = "shipped"
        payload = {
            "id": order_id,
            "status": new_status
        }
        headers = {"Content-Type": "application/json"}
        headers.update(auth_headers)
        body = {"input": payload}
        response = requests.post(update_url, headers=headers, json=body, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        updated_order = response.json().get("result")
        assert isinstance(updated_order, dict), "Response is not an object"
        assert updated_order.get("id") == order_id, "Updated order ID does not match"
        assert updated_order.get("status") == new_status, "Order status was not updated correctly"

        orders = list_orders(headers)
        assert any(o.get("id") == order_id and o.get("status") == new_status for o in orders), "Updated status not reflected in orders list"
    finally:
        delete_order(order_id, headers=auth_headers)

update_order_status_test()
