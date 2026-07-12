import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_createorder_should_place_order_with_valid_customer_and_shipping_info():
    url = f"{BASE_URL}/api/trpc/store.createOrder"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "customerEmail": "johndoe@example.com",
        "shippingAddress": "123 Elm Street, Apt 4",
        "governorate": "Cairo",
        "items": [
            {
                "productId": "prod-001",
                "quantity": 2
            },
            {
                "productId": "prod-002",
                "quantity": 1
            }
        ]
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to create order failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate keys in response for order confirmation (basic validation)
    expected_keys = ["orderId", "confirmationNumber", "status"]
    for key in expected_keys:
        assert key in data, f"Response JSON missing expected key: {key}"

    # Additional validations can include checking status value and types
    assert isinstance(data["orderId"], (str, int)), "orderId should be a string or integer"
    assert isinstance(data["confirmationNumber"], str), "confirmationNumber should be a string"
    assert data["status"].lower() in ["confirmed", "placed", "success"], "Unexpected order status"


test_createorder_should_place_order_with_valid_customer_and_shipping_info()
