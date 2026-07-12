import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_apitrpcstoreplaceorder_should_create_new_order():
    url = f"{BASE_URL}/api/trpc/store.placeOrder"
    headers = {
        "Content-Type": "application/json"
    }
    # Sample valid customer and cart details based on typical order structure
    payload = {
        "input": {
            "customer": {
                "name": "John Doe",
                "email": "johndoe@example.com",
                "phone": "1234567890",
                "address": "123 Main St, Anytown, USA"
            },
            "cart": [
                {
                    "productId": 1,
                    "quantity": 2
                },
                {
                    "productId": 2,
                    "quantity": 1
                }
            ],
            "paymentMethod": "credit_card"
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # The typical tRPC response wraps data inside 'result' > 'data'
    result_data = data.get('result', {}).get('data', {})

    # Check that keys corresponding to order confirmation and order number exist
    assert isinstance(result_data, dict), "Response 'result.data' is not a dictionary"

    # Try common keys for order confirmation
    confirmation_keys = ['orderConfirmation', 'confirmation', 'message']
    confirmation_present = any(key in result_data for key in confirmation_keys)
    assert confirmation_present, "Order confirmation missing in response"

    # Try common keys for order number
    order_number_keys = ['orderNumber', 'order_number', 'orderNo', 'order_id']
    order_number = None
    for key in order_number_keys:
        if key in result_data:
            order_number = result_data[key]
            break
    assert order_number is not None, "Order number missing in response"
    assert isinstance(order_number, (str, int)) and str(order_number).strip() != "", "Invalid order number"


test_post_apitrpcstoreplaceorder_should_create_new_order()
