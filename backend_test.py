#!/usr/bin/env python3
"""
Birthdayflix Backend API Test Suite
Tests all endpoints using the external production URL
"""

import requests
import json
import sys
from typing import Dict, Any

# Get backend URL from frontend .env
BACKEND_URL = "https://simran-singh-05-july.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_pass(msg: str):
    print(f"{Colors.GREEN}✓ PASS:{Colors.END} {msg}")

def log_fail(msg: str):
    print(f"{Colors.RED}✗ FAIL:{Colors.END} {msg}")

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ INFO:{Colors.END} {msg}")

def log_warn(msg: str):
    print(f"{Colors.YELLOW}⚠ WARN:{Colors.END} {msg}")

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def record_test(name: str, passed: bool, details: str = ""):
    test_results["tests"].append({
        "name": name,
        "passed": passed,
        "details": details
    })
    if passed:
        test_results["passed"] += 1
        log_pass(f"{name}")
    else:
        test_results["failed"] += 1
        log_fail(f"{name}")
    if details:
        print(f"  Details: {details}")

def test_health_check():
    """Test 1: GET /api/ - Health check"""
    log_info("Test 1: GET /api/ - Health check")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Birthdayflix API is alive":
                record_test("GET /api/ health check", True, f"Response: {data}")
            else:
                record_test("GET /api/ health check", False, f"Unexpected message: {data}")
        else:
            record_test("GET /api/ health check", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("GET /api/ health check", False, f"Exception: {str(e)}")

def test_get_profiles():
    """Test 2: GET /api/profiles - Should return 4 profiles"""
    log_info("Test 2: GET /api/profiles - Should return 4 profiles")
    try:
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            if len(profiles) == 4:
                expected_names = ["Simran", "Family", "Friends", "Kids"]
                actual_names = [p.get("name") for p in profiles]
                if all(name in actual_names for name in expected_names):
                    # Check each profile has required fields
                    all_valid = True
                    for p in profiles:
                        if not all(k in p for k in ["id", "name", "avatar", "color"]):
                            all_valid = False
                            break
                    if all_valid:
                        record_test("GET /api/profiles returns 4 valid profiles", True, 
                                  f"Profiles: {[p['name'] for p in profiles]}")
                    else:
                        record_test("GET /api/profiles returns 4 valid profiles", False, 
                                  "Some profiles missing required fields")
                else:
                    record_test("GET /api/profiles returns 4 valid profiles", False, 
                              f"Expected names {expected_names}, got {actual_names}")
            else:
                record_test("GET /api/profiles returns 4 valid profiles", False, 
                          f"Expected 4 profiles, got {len(profiles)}")
        else:
            record_test("GET /api/profiles returns 4 valid profiles", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("GET /api/profiles returns 4 valid profiles", False, f"Exception: {str(e)}")

def test_get_hero():
    """Test 3: GET /api/hero - Should return hero object"""
    log_info("Test 3: GET /api/hero - Should return hero object")
    try:
        response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
        if response.status_code == 200:
            hero = response.json()
            if hero.get("title") == "Simran Singh" and "05 July" in hero.get("subtitle", ""):
                if "backdrop" in hero:
                    record_test("GET /api/hero returns valid hero", True, 
                              f"Title: {hero['title']}, Subtitle: {hero['subtitle']}")
                else:
                    record_test("GET /api/hero returns valid hero", False, "Missing backdrop URL")
            else:
                record_test("GET /api/hero returns valid hero", False, 
                          f"Invalid hero data: {hero}")
        else:
            record_test("GET /api/hero returns valid hero", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("GET /api/hero returns valid hero", False, f"Exception: {str(e)}")

def test_get_categories():
    """Test 4: GET /api/categories - Should return 4 categories with 21 total items"""
    log_info("Test 4: GET /api/categories - Should return 4 categories with 21 items")
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            if len(categories) == 4:
                expected_ids = ["c1", "c2", "c3", "c4"]
                actual_ids = [c.get("id") for c in categories]
                total_items = sum(len(c.get("items", [])) for c in categories)
                
                if all(cid in actual_ids for cid in expected_ids):
                    record_test("GET /api/categories returns 4 categories", True, 
                              f"Categories: {actual_ids}, Total items: {total_items}")
                    return categories, total_items
                else:
                    record_test("GET /api/categories returns 4 categories", False, 
                              f"Expected IDs {expected_ids}, got {actual_ids}")
            else:
                record_test("GET /api/categories returns 4 categories", False, 
                          f"Expected 4 categories, got {len(categories)}")
        else:
            record_test("GET /api/categories returns 4 categories", False, 
                      f"Status {response.status_code}: {response.text}")
        return None, 0
    except Exception as e:
        record_test("GET /api/categories returns 4 categories", False, f"Exception: {str(e)}")
        return None, 0

def test_create_media_valid():
    """Test 5: POST /api/media with valid data"""
    log_info("Test 5: POST /api/media with valid category_id")
    try:
        payload = {
            "title": "Test Memory",
            "description": "testing",
            "category_id": "c1",
            "type": "photo",
            "image": "https://placehold.co/600x400",
            "year": "2025",
            "duration": "1 min"
        }
        response = requests.post(f"{BACKEND_URL}/media", json=payload, timeout=10)
        if response.status_code == 200:
            created_item = response.json()
            if created_item.get("id", "").startswith("u_"):
                if created_item.get("title") == "Test Memory" and created_item.get("category_id") == "c1":
                    record_test("POST /api/media creates item with generated id", True, 
                              f"Created item ID: {created_item['id']}")
                    return created_item["id"]
                else:
                    record_test("POST /api/media creates item with generated id", False, 
                              f"Item data mismatch: {created_item}")
            else:
                record_test("POST /api/media creates item with generated id", False, 
                          f"ID doesn't start with 'u_': {created_item.get('id')}")
        else:
            record_test("POST /api/media creates item with generated id", False, 
                      f"Status {response.status_code}: {response.text}")
        return None
    except Exception as e:
        record_test("POST /api/media creates item with generated id", False, f"Exception: {str(e)}")
        return None

def test_verify_created_item(item_id: str):
    """Test 6: Verify created item appears in GET /api/categories"""
    log_info("Test 6: Verify created item appears in categories")
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            c1_items = next((c["items"] for c in categories if c["id"] == "c1"), [])
            found = any(item.get("id") == item_id for item in c1_items)
            if found:
                record_test("Created item appears in GET /api/categories", True, 
                          f"Item {item_id} found in c1")
            else:
                record_test("Created item appears in GET /api/categories", False, 
                          f"Item {item_id} not found in c1")
        else:
            record_test("Created item appears in GET /api/categories", False, 
                      f"Status {response.status_code}")
    except Exception as e:
        record_test("Created item appears in GET /api/categories", False, f"Exception: {str(e)}")

def test_create_media_invalid_category():
    """Test 7: POST /api/media with invalid category_id"""
    log_info("Test 7: POST /api/media with invalid category_id")
    try:
        payload = {
            "title": "Invalid Test",
            "description": "should fail",
            "category_id": "cX",
            "type": "photo",
            "image": "https://placehold.co/600x400"
        }
        response = requests.post(f"{BACKEND_URL}/media", json=payload, timeout=10)
        if response.status_code == 400:
            record_test("POST /api/media rejects invalid category_id", True, 
                      f"Correctly returned 400: {response.json()}")
        else:
            record_test("POST /api/media rejects invalid category_id", False, 
                      f"Expected 400, got {response.status_code}: {response.text}")
    except Exception as e:
        record_test("POST /api/media rejects invalid category_id", False, f"Exception: {str(e)}")

def test_delete_media(item_id: str):
    """Test 8: DELETE /api/media/{id}"""
    log_info(f"Test 8: DELETE /api/media/{item_id}")
    try:
        response = requests.delete(f"{BACKEND_URL}/media/{item_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                record_test("DELETE /api/media/{id} removes item", True, 
                          f"Deleted item {item_id}")
            else:
                record_test("DELETE /api/media/{id} removes item", False, 
                          f"Unexpected response: {data}")
        else:
            record_test("DELETE /api/media/{id} removes item", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("DELETE /api/media/{id} removes item", False, f"Exception: {str(e)}")

def test_verify_deleted_item(item_id: str):
    """Test 9: Verify deleted item is gone from categories"""
    log_info("Test 9: Verify deleted item is gone from categories")
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            c1_items = next((c["items"] for c in categories if c["id"] == "c1"), [])
            found = any(item.get("id") == item_id for item in c1_items)
            if not found:
                record_test("Deleted item removed from GET /api/categories", True, 
                          f"Item {item_id} correctly removed")
            else:
                record_test("Deleted item removed from GET /api/categories", False, 
                          f"Item {item_id} still present in c1")
        else:
            record_test("Deleted item removed from GET /api/categories", False, 
                      f"Status {response.status_code}")
    except Exception as e:
        record_test("Deleted item removed from GET /api/categories", False, f"Exception: {str(e)}")

def test_delete_nonexistent():
    """Test 10: DELETE /api/media/nonexistent_id"""
    log_info("Test 10: DELETE /api/media/nonexistent_id")
    try:
        response = requests.delete(f"{BACKEND_URL}/media/nonexistent_id", timeout=10)
        if response.status_code == 404:
            record_test("DELETE nonexistent item returns 404", True, 
                      f"Correctly returned 404: {response.json()}")
        else:
            record_test("DELETE nonexistent item returns 404", False, 
                      f"Expected 404, got {response.status_code}: {response.text}")
    except Exception as e:
        record_test("DELETE nonexistent item returns 404", False, f"Exception: {str(e)}")

def test_reset():
    """Test 11: POST /api/reset"""
    log_info("Test 11: POST /api/reset")
    try:
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                record_test("POST /api/reset returns ok", True, f"Response: {data}")
            else:
                record_test("POST /api/reset returns ok", False, f"Unexpected response: {data}")
        else:
            record_test("POST /api/reset returns ok", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("POST /api/reset returns ok", False, f"Exception: {str(e)}")

def test_verify_reset():
    """Test 12: Verify reset restored seed data"""
    log_info("Test 12: Verify reset restored seed data (21 items, 4 profiles)")
    try:
        # Check categories
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            total_items = sum(len(c.get("items", [])) for c in categories)
            if len(categories) == 4 and total_items == 21:
                record_test("POST /api/reset restores 21 items in 4 categories", True, 
                          f"Categories: {len(categories)}, Items: {total_items}")
            else:
                record_test("POST /api/reset restores 21 items in 4 categories", False, 
                          f"Expected 4 categories with 21 items, got {len(categories)} categories with {total_items} items")
        else:
            record_test("POST /api/reset restores 21 items in 4 categories", False, 
                      f"Status {response.status_code}")
        
        # Check profiles
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            if len(profiles) == 4:
                record_test("POST /api/reset restores 4 profiles", True, 
                          f"Profiles: {len(profiles)}")
            else:
                record_test("POST /api/reset restores 4 profiles", False, 
                          f"Expected 4 profiles, got {len(profiles)}")
        else:
            record_test("POST /api/reset restores 4 profiles", False, 
                      f"Status {response.status_code}")
    except Exception as e:
        record_test("POST /api/reset verification", False, f"Exception: {str(e)}")

def main():
    print("=" * 80)
    print("BIRTHDAYFLIX BACKEND API TEST SUITE")
    print(f"Testing against: {BACKEND_URL}")
    print("=" * 80)
    print()
    
    # Run tests in sequence
    test_health_check()
    print()
    
    test_get_profiles()
    print()
    
    test_get_hero()
    print()
    
    categories, initial_count = test_get_categories()
    print()
    
    created_id = test_create_media_valid()
    print()
    
    if created_id:
        test_verify_created_item(created_id)
        print()
    
    test_create_media_invalid_category()
    print()
    
    if created_id:
        test_delete_media(created_id)
        print()
        
        test_verify_deleted_item(created_id)
        print()
    
    test_delete_nonexistent()
    print()
    
    test_reset()
    print()
    
    test_verify_reset()
    print()
    
    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {test_results['passed'] + test_results['failed']}")
    print(f"{Colors.GREEN}Passed: {test_results['passed']}{Colors.END}")
    print(f"{Colors.RED}Failed: {test_results['failed']}{Colors.END}")
    print()
    
    if test_results['failed'] > 0:
        print(f"{Colors.RED}FAILED TESTS:{Colors.END}")
        for test in test_results['tests']:
            if not test['passed']:
                print(f"  - {test['name']}")
                if test['details']:
                    print(f"    {test['details']}")
        sys.exit(1)
    else:
        print(f"{Colors.GREEN}ALL TESTS PASSED!{Colors.END}")
        sys.exit(0)

if __name__ == "__main__":
    main()
