import requests

import json

def test_getproductbyslug_should_return_product_details_for_valid_slug():
    base_url = "http://localhost:3000"
    timeout = 30

    # Step1: Get list of products to obtain a valid slug
    products_url = f"{base_url}/api/trpc/store.getProducts"
    try:
        products_resp = requests.get(products_url, timeout=timeout)
        assert products_resp.status_code == 200, f"Expected status 200, got {products_resp.status_code}"
        products_data = products_resp.json()
        assert isinstance(products_data, dict), "Products response is not a JSON object"
        # Assuming products are inside some key like 'result' or directly
        # As schema is generic object, attempt to find some products array
        slugs = []
        # Try to find any list of products inside response
        def find_slugs(obj):
            if isinstance(obj, list):
                return [p.get("slug") for p in obj if "slug" in p]
            if isinstance(obj, dict):
                for v in obj.values():
                    res = find_slugs(v)
                    if res:
                        return res
            return None
        slugs = find_slugs(products_data)
        assert slugs and len(slugs) > 0, "No product slugs found in product list"
        valid_slug = slugs[0]
    except Exception as e:
        raise AssertionError(f"Failed to retrieve valid product slug: {e}")

    # Step2: Use the valid slug to call getProductBySlug
    params = {
        "input": {"slug": valid_slug}
    }

    input_json = json.dumps(params["input"])
    endpoint = f"{base_url}/api/trpc/store.getProductBySlug"
    try:
        resp = requests.get(endpoint, params={"input": input_json}, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Request to getProductBySlug failed: {e}")

    assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}"

    try:
        data = resp.json()
    except Exception:
        raise AssertionError("Response is not in JSON format")

    assert isinstance(data, dict), "Response JSON is not an object"

    def contains_slug(obj, slug):
        if isinstance(obj, dict):
            for k,v in obj.items():
                if k == "slug" and v == slug:
                    return True
                if contains_slug(v, slug):
                    return True
        if isinstance(obj, list):
            return any(contains_slug(item, slug) for item in obj)
        return False

    assert contains_slug(data, valid_slug), f"Response does not contain the requested slug '{valid_slug}'"

test_getproductbyslug_should_return_product_details_for_valid_slug()