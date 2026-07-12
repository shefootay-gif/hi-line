import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_apitrpcadmincreateproduct_should_create_product():
    # Step 1: Login to get auth token
    login_url = f"{BASE_URL}/api/trpc/auth.login"
    login_payload = {
        "input": {
            "username": "admin",
            "password": "password123"
        }
    }
    login_headers = {"Content-Type": "application/json"}

    login_response = requests.post(login_url, json=login_payload, headers=login_headers, timeout=TIMEOUT)
    assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"

    login_json = login_response.json()
    assert "result" in login_json, "Login response missing 'result' key"
    auth_token = login_json["result"].get("token")
    assert auth_token, "Authentication token missing in login response"

    # Step 2: Use auth token to create product
    url = f"{BASE_URL}/api/trpc/admin.createProduct"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }

    payload = {
        "input": {
            "name": "Test Product",
            "description": "A product created for testing purpose",
            "price": 19.99,
            "sku": "TESTSKU123",
            "stock": 50,
            "category": "Test Category",
            "active": True
        }
    }

    response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    response_json = response.json()
    assert "result" in response_json, "Response JSON missing 'result' key"
    created_product = response_json["result"]
    assert isinstance(created_product, dict), "'result' is not a dict"

    for field in ("name", "description", "price", "sku", "stock", "category", "active"):
        assert field in created_product, f"Created product missing field '{field}'"
    assert created_product["name"] == payload["input"]["name"]
    assert created_product["description"] == payload["input"]["description"]
    assert isinstance(created_product["price"], (int, float)) and created_product["price"] == payload["input"]["price"]
    assert created_product["sku"] == payload["input"]["sku"]
    assert isinstance(created_product["stock"], int) and created_product["stock"] == payload["input"]["stock"]
    assert created_product["category"] == payload["input"]["category"]
    assert created_product["active"] == payload["input"]["active"]


test_post_apitrpcadmincreateproduct_should_create_product()
