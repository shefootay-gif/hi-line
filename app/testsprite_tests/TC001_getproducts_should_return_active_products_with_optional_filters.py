import requests
from requests.auth import HTTPBasicAuth

def test_getproducts_should_return_active_products_with_optional_filters():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/store.getProducts"
    url = f"{base_url}{endpoint}"
    auth = HTTPBasicAuth('admin', 'password123')
    headers = {
        "Accept": "application/json"
    }

    params = {}

    try:
        response = requests.get(url, auth=auth, headers=headers, params=params, timeout=30)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"

        json_data = response.json()
        assert isinstance(json_data, dict), "Response should be an object/dict"

        products = None
        # Try common structure from tRPC responses
        if "result" in json_data and isinstance(json_data["result"], dict) and "data" in json_data["result"] and isinstance(json_data["result"]["data"], list):
            products = json_data["result"]["data"]
        elif "data" in json_data and isinstance(json_data["data"], list):
            products = json_data["data"]
        else:
            # Try to find any list value inside the dict
            for v in json_data.values():
                if isinstance(v, list):
                    products = v
                    break

        assert products is not None, "Cannot find products list in response"
        assert isinstance(products, list), "Products data should be a list"

        for product in products:
            assert isinstance(product, dict), "Each product should be an object"
            assert "active" in product or "status" in product or "isActive" in product, "Product missing active status field"
            is_active = product.get("active") or product.get("isActive") or product.get("status")
            if isinstance(is_active, bool):
                assert is_active is True, "Product is not active"
            elif isinstance(is_active, int):
                assert is_active == 1, "Product is not active"
            elif isinstance(is_active, str):
                assert is_active.lower() in ("active", "true", "1"), "Product is not active"
            else:
                assert False, "Cannot determine product active status"
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_getproducts_should_return_active_products_with_optional_filters()
