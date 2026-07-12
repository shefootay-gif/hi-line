import requests

def test_post_apitrpcstoregetproducts_should_return_active_products():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/store.getProducts"
    url = base_url + endpoint

    headers = {
        "Content-Type": "application/json"
    }
    # Assuming the API expects a JSON-RPC or tRPC structured payload, sending an empty data object for listing active products
    payload = {}

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert 'result' in data, "Response JSON does not contain 'result' key"
    assert 'data' in data['result'], "Response JSON 'result' does not contain 'data' key"
    products = data['result']['data']

    assert isinstance(products, list), "'data' is not a list"

    for product in products:
        assert isinstance(product, dict), "Product item is not a dict"
        active = product.get('active')
        assert active is True, f"Product {product.get('id', product)} is not active"

test_post_apitrpcstoregetproducts_should_return_active_products()