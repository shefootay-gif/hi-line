import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def login_admin_get_token(email, password):
    url = f"{BASE_URL}/api/trpc/auth.localAdminLogin"
    headers = {"Content-Type": "application/json"}
    payload = {"email": email, "password": password}
    response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Admin login failed with status {response.status_code}"
    data = response.json()
    token = data.get("token") or data.get("accessToken") or data.get("sessionToken")
    assert token, "No token received on admin login"
    return token


def test_createproduct_should_create_new_product_with_valid_data():
    token = login_admin_get_token("admin@example.com", "password123")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    url = f"{BASE_URL}/api/trpc/admin.createProduct"
    product_data = {
        "name": "Test Product",
        "description": "A product created during automated testing.",
        "price": 19.99,
        "currency": "USD",
        "sku": "TESTSKU123",
        "category": "Testing",
        "stock": 10,
        "active": True
    }
    created_product_id = None
    try:
        response = requests.post(
            url,
            json=product_data,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        json_response = response.json()
        assert isinstance(json_response, dict), "Response JSON is not an object"
        for key in product_data.keys():
            assert key in json_response, f"Missing key '{key}' in response"
        created_product_id = json_response.get("id")
        assert created_product_id is not None, "Created product ID not found in response"
    finally:
        # No deleteProduct API defined in PRD, so skip cleanup for now
        pass


test_createproduct_should_create_new_product_with_valid_data()