import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("admin", "password123")
TIMEOUT = 30

def test_post_apitrpcadminupdateproduct_should_update_product():
    headers = {"Content-Type": "application/json"}

    # Step 1: Authenticate and get ready to create a product
    # Step 2: Create a new product (since no existing product ID provided) to update later
    create_payload = {
        "method": "admin.createProduct",
        "params": {
            "input": {
                "name": "Test Product",
                "description": "Initial product for update test",
                "price": 999,
                "sku": "TESTSKU001",
                "stock": 10,
                "active": True
            }
        }
    }
    product_id = None
    try:
        create_resp = requests.post(
            f"{BASE_URL}/api/trpc/admin.createProduct",
            auth=AUTH,
            headers=headers,
            json=create_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Create product failed: {create_resp.text}"
        create_data = create_resp.json()
        # Extract product ID from response (assuming data structure typical of tRPC JSON APIs)
        product_result = create_data.get("result", {}).get("data")
        assert product_result is not None, "No product data returned on create"
        product_id = product_result.get("id")
        assert product_id is not None, "Created product ID missing"

        # Step 3: Update the created product
        update_payload = {
            "method": "admin.updateProduct",
            "params": {
                "input": {
                    "id": product_id,
                    "name": "Updated Test Product",
                    "description": "Updated product description",
                    "price": 888,
                    "sku": "TESTSKU001-UPDATED",
                    "stock": 20,
                    "active": False
                }
            }
        }
        update_resp = requests.post(
            f"{BASE_URL}/api/trpc/admin.updateProduct",
            auth=AUTH,
            headers=headers,
            json=update_payload,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update product failed: {update_resp.text}"
        update_data = update_resp.json()
        updated_product = update_data.get("result", {}).get("data")
        assert updated_product is not None, "No product data returned on update"
        # Validate updated fields
        assert updated_product["id"] == product_id
        assert updated_product["name"] == "Updated Test Product"
        assert updated_product["description"] == "Updated product description"
        assert updated_product["price"] == 888
        assert updated_product["sku"] == "TESTSKU001-UPDATED"
        assert updated_product["stock"] == 20
        assert updated_product["active"] is False

    finally:
        if product_id:
            # Clean up by deleting the product created for this test
            delete_payload = {
                "method": "admin.deleteProduct",
                "params": {
                    "input": {
                        "id": product_id
                    }
                }
            }
            try:
                delete_resp = requests.post(
                    f"{BASE_URL}/api/trpc/admin.deleteProduct",
                    auth=AUTH,
                    headers=headers,
                    json=delete_payload,
                    timeout=TIMEOUT
                )
                assert delete_resp.status_code == 200, f"Cleanup failed to delete product: {delete_resp.text}"
            except Exception:
                # Best effort cleanup, suppress exceptions here
                pass

test_post_apitrpcadminupdateproduct_should_update_product()