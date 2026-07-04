#!/usr/bin/env python3
"""
Test suite for PUT /api/profiles/{id} endpoint
Tests the new profile update functionality and regression tests for hero endpoint
"""

import requests
import json
import sys

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

def test_1_reset():
    """Test 1: POST /api/reset to restore defaults"""
    log_info("Test 1: POST /api/reset to restore defaults")
    try:
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                record_test("Test 1: POST /api/reset", True, f"Response: {data}")
                return True
            else:
                record_test("Test 1: POST /api/reset", False, f"Unexpected response: {data}")
                return False
        else:
            record_test("Test 1: POST /api/reset", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 1: POST /api/reset", False, f"Exception: {str(e)}")
        return False

def test_2_verify_simran():
    """Test 2: GET /api/profiles → verify Simran (id=p1) with name "Simran" and avatar containing "customer-assets" """
    log_info("Test 2: GET /api/profiles → verify Simran profile")
    try:
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            simran = next((p for p in profiles if p.get("id") == "p1"), None)
            if simran:
                name_ok = simran.get("name") == "Simran"
                avatar_ok = "customer-assets" in simran.get("avatar", "")
                if name_ok and avatar_ok:
                    record_test("Test 2: Verify Simran profile", True, 
                              f"name='{simran['name']}', avatar contains 'customer-assets'")
                    return simran
                else:
                    record_test("Test 2: Verify Simran profile", False, 
                              f"name={simran.get('name')} (expected 'Simran'), avatar={simran.get('avatar')}")
                    return None
            else:
                record_test("Test 2: Verify Simran profile", False, "Profile p1 not found")
                return None
        else:
            record_test("Test 2: Verify Simran profile", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        record_test("Test 2: Verify Simran profile", False, f"Exception: {str(e)}")
        return None

def test_3_update_simran():
    """Test 3: PUT /api/profiles/p1 with body {"name":"Simran S","avatar":"https://placehold.co/300"} → expect 200"""
    log_info("Test 3: PUT /api/profiles/p1 with name and avatar update")
    try:
        payload = {
            "name": "Simran S",
            "avatar": "https://placehold.co/300"
        }
        response = requests.put(f"{BACKEND_URL}/profiles/p1", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            name_ok = updated.get("name") == "Simran S"
            avatar_ok = updated.get("avatar") == "https://placehold.co/300"
            if name_ok and avatar_ok:
                record_test("Test 3: PUT /api/profiles/p1 update", True, 
                          f"name='{updated['name']}', avatar='{updated['avatar']}'")
                return True
            else:
                record_test("Test 3: PUT /api/profiles/p1 update", False, 
                          f"Response mismatch: {updated}")
                return False
        else:
            record_test("Test 3: PUT /api/profiles/p1 update", False, 
                      f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 3: PUT /api/profiles/p1 update", False, f"Exception: {str(e)}")
        return False

def test_4_verify_persistence():
    """Test 4: GET /api/profiles → verify the change persists"""
    log_info("Test 4: GET /api/profiles → verify changes persist")
    try:
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            simran = next((p for p in profiles if p.get("id") == "p1"), None)
            if simran:
                name_ok = simran.get("name") == "Simran S"
                avatar_ok = simran.get("avatar") == "https://placehold.co/300"
                if name_ok and avatar_ok:
                    record_test("Test 4: Verify changes persist", True, 
                              f"name='{simran['name']}', avatar='{simran['avatar']}'")
                    return True
                else:
                    record_test("Test 4: Verify changes persist", False, 
                              f"Changes not persisted: {simran}")
                    return False
            else:
                record_test("Test 4: Verify changes persist", False, "Profile p1 not found")
                return False
        else:
            record_test("Test 4: Verify changes persist", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 4: Verify changes persist", False, f"Exception: {str(e)}")
        return False

def test_5_empty_update():
    """Test 5: PUT /api/profiles/p1 with body {} → expect 400 "No fields to update" """
    log_info("Test 5: PUT /api/profiles/p1 with empty body → expect 400")
    try:
        payload = {}
        response = requests.put(f"{BACKEND_URL}/profiles/p1", json=payload, timeout=10)
        if response.status_code == 400:
            error = response.json()
            if "No fields to update" in error.get("detail", ""):
                record_test("Test 5: Empty update returns 400", True, 
                          f"Correctly returned 400: {error}")
                return True
            else:
                record_test("Test 5: Empty update returns 400", False, 
                          f"400 returned but wrong message: {error}")
                return False
        else:
            record_test("Test 5: Empty update returns 400", False, 
                      f"Expected 400, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 5: Empty update returns 400", False, f"Exception: {str(e)}")
        return False

def test_6_nonexistent_profile():
    """Test 6: PUT /api/profiles/nonexistent → expect 404"""
    log_info("Test 6: PUT /api/profiles/nonexistent → expect 404")
    try:
        payload = {"name": "Test"}
        response = requests.put(f"{BACKEND_URL}/profiles/nonexistent", json=payload, timeout=10)
        if response.status_code == 404:
            error = response.json()
            record_test("Test 6: Nonexistent profile returns 404", True, 
                      f"Correctly returned 404: {error}")
            return True
        else:
            record_test("Test 6: Nonexistent profile returns 404", False, 
                      f"Expected 404, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 6: Nonexistent profile returns 404", False, f"Exception: {str(e)}")
        return False

def test_7_partial_update():
    """Test 7: PUT /api/profiles/p2 with body {"name":"Fam"} → expect 200 and only name updated (avatar unchanged)"""
    log_info("Test 7: PUT /api/profiles/p2 with partial update (name only)")
    try:
        # First get the current avatar
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code != 200:
            record_test("Test 7: Partial update p2", False, "Failed to get profiles")
            return False
        
        profiles = response.json()
        p2 = next((p for p in profiles if p.get("id") == "p2"), None)
        if not p2:
            record_test("Test 7: Partial update p2", False, "Profile p2 not found")
            return False
        
        original_avatar = p2.get("avatar")
        original_color = p2.get("color")
        
        # Now update only the name
        payload = {"name": "Fam"}
        response = requests.put(f"{BACKEND_URL}/profiles/p2", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            name_ok = updated.get("name") == "Fam"
            avatar_unchanged = updated.get("avatar") == original_avatar
            color_unchanged = updated.get("color") == original_color
            
            if name_ok and avatar_unchanged and color_unchanged:
                record_test("Test 7: Partial update p2", True, 
                          f"name='Fam', avatar unchanged, color unchanged")
                return True
            else:
                record_test("Test 7: Partial update p2", False, 
                          f"name={updated.get('name')}, avatar changed={not avatar_unchanged}, color changed={not color_unchanged}")
                return False
        else:
            record_test("Test 7: Partial update p2", False, 
                      f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 7: Partial update p2", False, f"Exception: {str(e)}")
        return False

def test_8_reset_and_verify():
    """Test 8: POST /api/reset → GET /api/profiles should have Simran back to original name "Simran" """
    log_info("Test 8: POST /api/reset → verify Simran back to original")
    try:
        # Reset
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code != 200:
            record_test("Test 8: Reset and verify Simran restored", False, 
                      f"Reset failed: {response.status_code}")
            return False
        
        # Verify Simran is back to original
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            simran = next((p for p in profiles if p.get("id") == "p1"), None)
            if simran:
                name_ok = simran.get("name") == "Simran"
                avatar_ok = "customer-assets" in simran.get("avatar", "")
                if name_ok and avatar_ok:
                    record_test("Test 8: Reset and verify Simran restored", True, 
                              f"Simran restored: name='Simran', avatar contains 'customer-assets'")
                    return True
                else:
                    record_test("Test 8: Reset and verify Simran restored", False, 
                              f"Simran not restored correctly: {simran}")
                    return False
            else:
                record_test("Test 8: Reset and verify Simran restored", False, "Profile p1 not found")
                return False
        else:
            record_test("Test 8: Reset and verify Simran restored", False, 
                      f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 8: Reset and verify Simran restored", False, f"Exception: {str(e)}")
        return False

def test_9_hero_update():
    """Test 9: PUT /api/hero with {"backdrop":"https://placehold.co/1920x1080"} → 200 and hero.backdrop updated. Then GET /api/hero to confirm."""
    log_info("Test 9: PUT /api/hero with backdrop update")
    try:
        payload = {"backdrop": "https://placehold.co/1920x1080"}
        response = requests.put(f"{BACKEND_URL}/hero", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            backdrop_ok = updated.get("backdrop") == "https://placehold.co/1920x1080"
            if backdrop_ok:
                # Verify with GET
                response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
                if response.status_code == 200:
                    hero = response.json()
                    if hero.get("backdrop") == "https://placehold.co/1920x1080":
                        record_test("Test 9: PUT /api/hero backdrop update", True, 
                                  f"backdrop updated and persisted")
                        return True
                    else:
                        record_test("Test 9: PUT /api/hero backdrop update", False, 
                                  f"GET returned different backdrop: {hero.get('backdrop')}")
                        return False
                else:
                    record_test("Test 9: PUT /api/hero backdrop update", False, 
                              f"GET failed: {response.status_code}")
                    return False
            else:
                record_test("Test 9: PUT /api/hero backdrop update", False, 
                          f"backdrop not updated: {updated.get('backdrop')}")
                return False
        else:
            record_test("Test 9: PUT /api/hero backdrop update", False, 
                      f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 9: PUT /api/hero backdrop update", False, f"Exception: {str(e)}")
        return False

def test_10_hero_reset():
    """Test 10: POST /api/reset → hero.backdrop should be back to the customer-assets URL"""
    log_info("Test 10: POST /api/reset → verify hero.backdrop restored")
    try:
        # Reset
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code != 200:
            record_test("Test 10: Reset and verify hero restored", False, 
                      f"Reset failed: {response.status_code}")
            return False
        
        # Verify hero backdrop is back to customer-assets
        response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
        if response.status_code == 200:
            hero = response.json()
            backdrop_ok = "customer-assets" in hero.get("backdrop", "")
            if backdrop_ok:
                record_test("Test 10: Reset and verify hero restored", True, 
                          f"hero.backdrop restored to customer-assets URL")
                return True
            else:
                record_test("Test 10: Reset and verify hero restored", False, 
                          f"hero.backdrop not restored: {hero.get('backdrop')}")
                return False
        else:
            record_test("Test 10: Reset and verify hero restored", False, 
                      f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        record_test("Test 10: Reset and verify hero restored", False, f"Exception: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("PUT /api/profiles/{id} ENDPOINT TEST SUITE")
    print(f"Testing against: {BACKEND_URL}")
    print("=" * 80)
    print()
    
    # Run tests in sequence
    test_1_reset()
    print()
    
    test_2_verify_simran()
    print()
    
    test_3_update_simran()
    print()
    
    test_4_verify_persistence()
    print()
    
    test_5_empty_update()
    print()
    
    test_6_nonexistent_profile()
    print()
    
    test_7_partial_update()
    print()
    
    test_8_reset_and_verify()
    print()
    
    test_9_hero_update()
    print()
    
    test_10_hero_reset()
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
