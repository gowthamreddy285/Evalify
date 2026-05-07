import requests
import json

def test_signup():
    url = "http://localhost:8000/signup"
    payload = {
        "name": "testuser_unique",
        "email": "test_unique@example.com",
        "password": "password123"
    }
    
    print(f"--- BACKEND SIGNUP TEST ---")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"STATUS CODE: {response.status_code}")
        print(f"RESPONSE: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")
    print(f"----------------------------")

if __name__ == "__main__":
    test_signup()
