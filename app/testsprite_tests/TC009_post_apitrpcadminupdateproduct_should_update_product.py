import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("admin", "password123")
TIMEOUT = 30

def test_post_apitrpcadminupdateproduct_should_update_product():
    headers = {"Content-Type": "application/json"}

    # Step 1: Get existing products to have a product to update
    response = requests.post(
        f"{BASE_URL}/api/trpc/admin.listProducts",
        auth=AUTH,
        json={},
        headers=headers,
        timeout=TIMEOUT
    )
    assert response.status_code == 200, f"Failed to list products: {response.text}"
    products = response.json()
    assert isinstance(products, dict) and "result" in products, "Unexpected response format on listProducts"

    product_list = products["result"].get("data") or []
    assert isinstance(product_list, list), "Product list data is not a list"
    assert len(product_list) > 0, "No existing products found to update"

    # Choose the first product to update
    original_product = product_list[0]

    # Prepare updated product data (for example, toggle the isActive status or increment price slightly)
    updated_product = original_product.copy()
    # Minimal updates, such as appending " Updated" to the product name
    if "name" in updated_product and isinstance(updated_product["name"], str):
        updated_product["name"] = updated_product["name"] + " Updated"
    # Adjust price by +1 if price field exists and is numeric
    if "price" in updated_product and (isinstance(updated_product["price"], int) or isinstance(updated_product["price"], float)):
        updated_product["price"] = round(float(updated_product["price"]) + 1.0, 2)

    # Step 2: Call updateProduct API
    update_response = requests.post(
        f"{BASE_URL}/api/trpc/admin.updateProduct",
        auth=AUTH,
        json=updated_product,
        headers=headers,
        timeout=TIMEOUT
    )
    assert update_response.status_code == 200, f"Update product failed: {update_response.text}"

    response_json = update_response.json()
    assert isinstance(response_json, dict) and "result" in response_json, "Unexpected response format on updateProduct"

    updated_data = response_json["result"].get("data")
    assert updated_data is not None, "Response missing updated product data"

    # Validate updated fields match the request updates
    if "name" in updated_product:
        assert updated_data.get("name") == updated_product["name"], "Product name was not updated correctly"
    if "price" in updated_product:
        # Compare price as float rounded to 2 decimals
        updated_price = updated_data.get("price")
        if updated_price is not None:
            assert round(float(updated_price), 2) == updated_product["price"], "Product price was not updated correctly"

    # Validate that product id is unchanged
    assert updated_data.get("id") == original_product.get("id"), "Product ID changed after update"

    # Cleanup: revert product to original state to not affect other tests
    revert_resp = requests.post(
        f"{BASE_URL}/api/trpc/admin.updateProduct",
        auth=AUTH,
        json=original_product,
        headers=headers,
        timeout=TIMEOUT
    )
    assert revert_resp.status_code == 200, f"Failed to revert product after test: {revert_resp.text}"


test_post_apitrpcadminupdateproduct_should_update_product()
