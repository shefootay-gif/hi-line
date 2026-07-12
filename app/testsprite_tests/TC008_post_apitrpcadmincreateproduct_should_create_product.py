import requests

def test_post_apitrpcadmincreateproduct_should_create_product():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/api/trpc/auth.login"
    create_url = f"{base_url}/api/trpc/admin.createProduct"
    delete_url = f"{base_url}/api/trpc/admin.deleteProduct"

    # Login to get auth token
    login_payload = {"username": "admin", "password": "password123"}
    headers = {"Content-Type": "application/json"}
    login_response = requests.post(login_url, json=login_payload, headers=headers, timeout=30)
    assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
    login_data = login_response.json()
    assert "token" in login_data, "Login response missing 'token'"
    token = login_data["token"]

    auth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Example complete product data payload
    payload = {
        "name": "Test Product",
        "description": "A product created during automated testing",
        "price": 19.99,
        "sku": "TESTSKU123",
        "stock": 100,
        "category": "TestCategory",
        "active": True
    }

    created_product_id = None
    try:
        response = requests.post(create_url, json=payload, headers=auth_headers, timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()
        assert "id" in data, "Response JSON missing 'id'"
        created_product_id = data["id"]
        assert data["name"] == payload["name"]
        assert data["description"] == payload["description"]
        assert float(data["price"]) == float(payload["price"])
        assert data["sku"] == payload["sku"]
        assert int(data["stock"]) == int(payload["stock"])
        assert data["category"] == payload["category"]
        assert data["active"] == payload["active"]
    finally:
        if created_product_id:
            delete_payload = {"id": created_product_id}
            del_response = requests.post(delete_url, json=delete_payload, headers=auth_headers, timeout=30)
            assert del_response.status_code == 200, f"Cleanup delete failed with status {del_response.status_code}"

test_post_apitrpcadmincreateproduct_should_create_product()
