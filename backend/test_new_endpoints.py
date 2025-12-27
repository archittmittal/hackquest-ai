#!/usr/bin/env python
"""Test script for new API endpoints."""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

# Test data
test_email = f"test_user_{datetime.now().timestamp()}@test.com"
test_password = "TestPassword123!"

def print_response(title, response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"📝 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        return data
    except:
        print(response.text)
        return None

def test_auth_flow():
    """Test user registration and login."""
    print("\n🔐 TESTING AUTHENTICATION FLOW")
    
    # Register user
    register_data = {
        "email": test_email,
        "password": test_password,
        "username": test_email.split("@")[0]
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    register_result = print_response("Register User", response)
    
    if response.status_code != 200:
        print("❌ Registration failed!")
        return None
    
    # Login user
    login_data = {
        "email": test_email,
        "password": test_password
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    login_result = print_response("Login User", response)
    
    if response.status_code != 200:
        print("❌ Login failed!")
        return None
    
    token = login_result.get("access_token")
    return token

def test_profile_update(token):
    """Test profile update endpoint."""
    print("\n👤 TESTING PROFILE UPDATE")
    
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "username": "test_hacker",
        "bio": "Passionate about hackathons and AI",
        "avatar_url": "https://avatar.example.com/user.jpg",
        "skills": ["Python", "JavaScript", "React", "Machine Learning"],
        "experience_level": "intermediate",
        "available_from": "2025-01-15",
        "timezone": "UTC"
    }
    response = requests.post(f"{BASE_URL}/api/profile/update", 
                            json=profile_data, headers=headers)
    return print_response("Update Profile", response)

def test_code_generation(token):
    """Test code generation endpoint."""
    print("\n💻 TESTING CODE GENERATION")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Python generation
    code_data = {
        "prompt": "Create a function that calculates fibonacci numbers",
        "language": "python",
        "framework": None
    }
    response = requests.post(f"{BASE_URL}/api/generate/code", 
                            json=code_data, headers=headers)
    print_response("Generate Python Code", response)
    
    # Test JavaScript with React
    code_data = {
        "prompt": "Create a simple counter component",
        "language": "javascript",
        "framework": "react"
    }
    response = requests.post(f"{BASE_URL}/api/generate/code", 
                            json=code_data, headers=headers)
    print_response("Generate React Component", response)

def test_hackathon_creation(token):
    """Test creating hackathons for matching."""
    print("\n🏆 TESTING HACKATHON CREATION")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    hackathons = [
        {
            "title": "AI Innovators Summit 2025",
            "platform": "devpost",
            "description": "Build AI-powered applications",
            "skills_required": ["Python", "Machine Learning", "TensorFlow"],
            "difficulty": "advanced",
            "prize_pool": 50000,
            "location": "San Francisco, CA",
            "start_date": "2025-02-01",
            "end_date": "2025-02-03",
            "max_participants": 100,
            "themes": ["AI", "Healthcare"]
        },
        {
            "title": "Web Dev Masters",
            "platform": "devpost",
            "description": "Build amazing web applications",
            "skills_required": ["JavaScript", "React", "Node.js"],
            "difficulty": "intermediate",
            "prize_pool": 25000,
            "location": "New York, NY",
            "start_date": "2025-02-15",
            "end_date": "2025-02-17",
            "max_participants": 80,
            "themes": ["Web", "Fintech"]
        },
        {
            "title": "IoT Challenge",
            "platform": "devpost",
            "description": "IoT and hardware hacking",
            "skills_required": ["Python", "Arduino", "IoT"],
            "difficulty": "intermediate",
            "prize_pool": 15000,
            "location": "Austin, TX",
            "start_date": "2025-03-01",
            "end_date": "2025-03-03",
            "max_participants": 60,
            "themes": ["IoT", "Hardware"]
        }
    ]
    
    for hackathon in hackathons:
        response = requests.post(f"{BASE_URL}/api/hackathons", 
                               json=hackathon, headers=headers)
        print_response(f"Create Hackathon: {hackathon['title']}", response)

def test_matching(token):
    """Test hackathon matching endpoint."""
    print("\n🎯 TESTING HACKATHON MATCHING")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/matching/recommendations", 
                           headers=headers)
    result = print_response("Get Hackathon Recommendations", response)
    return result

def test_search(token):
    """Test hackathon search endpoint."""
    print("\n🔍 TESTING HACKATHON SEARCH")
    
    headers = {"Authorization": f"Bearer {token}"}
    search_data = {
        "query": "AI",
        "difficulty": "intermediate",
        "min_prize": 10000,
        "location": None,
        "skills": ["Python"],
        "limit": 10
    }
    response = requests.post(f"{BASE_URL}/api/hackathons/search", 
                            json=search_data, headers=headers)
    return print_response("Search Hackathons", response)

def test_password_reset(email):
    """Test password reset flow."""
    print("\n🔑 TESTING PASSWORD RESET")
    
    # Request reset token
    reset_data = {"email": email}
    response = requests.post(f"{BASE_URL}/api/auth/password-reset/request", 
                            json=reset_data)
    reset_result = print_response("Request Password Reset", response)
    
    if response.status_code == 200:
        # In real scenario, token would be sent via email
        # For testing, we'll use a placeholder
        token = "test_reset_token"
        confirm_data = {
            "email": email,
            "token": token,
            "new_password": "NewPassword456!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/password-reset/confirm", 
                                json=confirm_data)
        print_response("Confirm Password Reset", response)

def test_email_verification(token):
    """Test email verification."""
    print("\n📧 TESTING EMAIL VERIFICATION")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/auth/email/verify", 
                            headers=headers)
    verify_result = print_response("Send Verification Email", response)

if __name__ == "__main__":
    print("🚀 Starting API endpoint tests...")
    print(f"Base URL: {BASE_URL}")
    
    # Test authentication flow
    token = test_auth_flow()
    
    if token:
        print(f"\n✅ Authentication successful! Token: {token[:20]}...")
        
        # Test other endpoints
        test_profile_update(token)
        test_code_generation(token)
        test_hackathon_creation(token)
        test_matching(token)
        test_search(token)
        test_email_verification(token)
    
    # Test password reset (doesn't require auth)
    test_password_reset(test_email)
    
    print("\n\n🎉 Testing completed!")
