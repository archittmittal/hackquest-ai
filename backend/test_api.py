"""Test script for HackQuest AI backend API"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoints"""
    print("\n🏥 Testing Health Endpoints...")
    
    # Root health check
    response = requests.get(f"{BASE_URL}/")
    print(f"GET / → {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    # API health check
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"\nGET /api/health → {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_register():
    """Test user registration"""
    print("\n📝 Testing User Registration...")
    
    payload = {
        "email": "testuser@example.com",
        "password": "Test@1234",
        "username": "testuser",
        "full_name": "Test User"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print(f"POST /api/auth/register → {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Registration successful")
        print(f"  User: {data['user']['email']}")
        print(f"  Token: {data['access_token'][:20]}...")
        return data['access_token']
    else:
        print(f"✗ Error: {response.text}")
        return None


def test_login(email: str = "testuser@example.com", password: str = "Test@1234"):
    """Test user login"""
    print("\n🔐 Testing User Login...")
    
    payload = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print(f"POST /api/auth/login → {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Login successful")
        print(f"  User: {data['user']['email']}")
        print(f"  Token: {data['access_token'][:20]}...")
        return data['access_token']
    else:
        print(f"✗ Error: {response.text}")
        return None


def test_profile(token: str):
    """Test get user profile"""
    print("\n👤 Testing Get User Profile...")
    
    params = {"token": token}
    response = requests.get(f"{BASE_URL}/api/auth/me", params=params)
    print(f"GET /api/auth/me → {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Profile retrieved")
        print(f"  Email: {data['email']}")
        print(f"  Username: {data['username']}")
        print(json.dumps(data, indent=2))
    else:
        print(f"✗ Error: {response.text}")


def test_oauth():
    """Test OAuth endpoints"""
    print("\n🔗 Testing OAuth Endpoints...")
    
    payload = {
        "email": "github_user@example.com",
        "username": "github_user",
        "full_name": "GitHub User",
        "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/oauth/github", json=payload)
    print(f"POST /api/auth/oauth/github → {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ GitHub OAuth successful")
        print(f"  User: {data['user']['email']}")
        return data['access_token']
    else:
        print(f"✗ Error: {response.text}")
        return None


def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 HackQuest AI Backend API Test Suite")
    print("=" * 60)
    
    try:
        # Test health first
        test_health()
        
        time.sleep(0.5)
        
        # Test registration
        token = test_register()
        
        if token:
            # Test profile with token
            test_profile(token)
        
        time.sleep(0.5)
        
        # Test login
        login_token = test_login()
        
        if login_token:
            # Test profile with login token
            test_profile(login_token)
        
        time.sleep(0.5)
        
        # Test OAuth
        oauth_token = test_oauth()
        
        print("\n" + "=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to backend at http://localhost:8000")
        print("Please ensure the backend server is running.")


if __name__ == "__main__":
    main()
