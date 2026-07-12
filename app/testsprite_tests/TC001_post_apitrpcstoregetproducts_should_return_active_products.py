import requests

def test_post_apitrpcstoregetproducts_should_return_active_products():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/store.getProducts"
    url = base_url + endpoint

    headers = {
        "Content-Type": "application/json"
    }
    # As per PRD and user flows, this endpoint accepts a valid request payload.
    # Using empty JSON object as valid payload.
    payload = {}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    products = None
    if isinstance(data, dict):
        products = data.get("result", {}).get("data", None)
        if products is None:
            products = data.get("data", None)
    else:
        products = data

    assert isinstance(products, list), "Expected products to be a list"

    for product in products:
        assert isinstance(product, dict), "Each product should be a dictionary"
        if "active" in product:
            assert product["active"] is True, "Product is not active"

test_post_apitrpcstoregetproducts_should_return_active_products()