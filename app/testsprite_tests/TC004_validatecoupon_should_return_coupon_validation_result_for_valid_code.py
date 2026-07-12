import requests

def test_validatecoupon_should_return_coupon_validation_result_for_valid_code():
    base_url = "http://localhost:3000"
    endpoint = "/api/trpc/store.validateCoupon"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    # Prepare a valid coupon code for testing
    payload = {
        "input": {
            "code": "VALIDCOUPON2024"
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        # Validate status code
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        # Validate that response is JSON and contains expected keys indicating validation result
        response_json = response.json()
        assert isinstance(response_json, dict), "Response is not a JSON object"
        # Check at least 'valid' key presence
        assert "valid" in response_json, "'valid' key not found in response"
        # Optionally: validate that coupon is valid
        assert response_json["valid"] is True, "Coupon code validation result is not True"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_validatecoupon_should_return_coupon_validation_result_for_valid_code()
