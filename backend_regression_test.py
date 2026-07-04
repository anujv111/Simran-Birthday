#!/usr/bin/env python3
"""
Birthdayflix Backend Regression + New Endpoint Testing
Tests video_url field support and PUT /api/hero endpoint
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
    """Test 1: POST /api/reset → expect {"ok": true}"""
    log_info("Test 1: POST /api/reset")
    try:
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                record_test("1. POST /api/reset returns {ok: true}", True, f"Response: {data}")
                return True
            else:
                record_test("1. POST /api/reset returns {ok: true}", False, f"Unexpected response: {data}")
        else:
            record_test("1. POST /api/reset returns {ok: true}", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("1. POST /api/reset returns {ok: true}", False, f"Exception: {str(e)}")
    return False

def test_2_profiles():
    """Test 2: GET /api/profiles → expect 4 profiles, Simran (p1) has real photo"""
    log_info("Test 2: GET /api/profiles - verify 4 profiles and Simran's real photo")
    try:
        response = requests.get(f"{BACKEND_URL}/profiles", timeout=10)
        if response.status_code == 200:
            profiles = response.json()
            if len(profiles) == 4:
                # Find Simran profile
                simran = next((p for p in profiles if p.get("id") == "p1"), None)
                if simran:
                    avatar = simran.get("avatar", "")
                    if "customer-assets.emergentagent.com" in avatar:
                        record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", True, 
                                  f"Simran avatar: {avatar[:80]}...")
                        return True
                    else:
                        record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", False, 
                                  f"Simran avatar doesn't contain customer-assets URL: {avatar}")
                else:
                    record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", False, 
                              "Simran profile (id=p1) not found")
            else:
                record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", False, 
                          f"Expected 4 profiles, got {len(profiles)}")
        else:
            record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("2. GET /api/profiles returns 4 profiles, Simran has real photo", False, f"Exception: {str(e)}")
    return False

def test_3_hero():
    """Test 3: GET /api/hero → expect title "Simran Singh", backdrop with real photo, video_url field"""
    log_info("Test 3: GET /api/hero - verify title, backdrop, and video_url field")
    try:
        response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
        if response.status_code == 200:
            hero = response.json()
            title_ok = hero.get("title") == "Simran Singh"
            backdrop = hero.get("backdrop", "")
            backdrop_ok = "customer-assets.emergentagent.com" in backdrop
            video_url_ok = "video_url" in hero
            
            if title_ok and backdrop_ok and video_url_ok:
                record_test("3. GET /api/hero has title, real backdrop, video_url field", True, 
                          f"Title: {hero['title']}, Backdrop: {backdrop[:60]}..., video_url: '{hero.get('video_url')}'")
                return True
            else:
                issues = []
                if not title_ok:
                    issues.append(f"title is '{hero.get('title')}' not 'Simran Singh'")
                if not backdrop_ok:
                    issues.append(f"backdrop doesn't contain customer-assets: {backdrop}")
                if not video_url_ok:
                    issues.append("video_url field missing")
                record_test("3. GET /api/hero has title, real backdrop, video_url field", False, 
                          f"Issues: {', '.join(issues)}")
        else:
            record_test("3. GET /api/hero has title, real backdrop, video_url field", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("3. GET /api/hero has title, real backdrop, video_url field", False, f"Exception: {str(e)}")
    return False

def test_4_categories():
    """Test 4: GET /api/categories → expect 4 categories, 21 items, each item has video_url field"""
    log_info("Test 4: GET /api/categories - verify 4 categories, 21 items, video_url field in items")
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            if len(categories) == 4:
                total_items = sum(len(c.get("items", [])) for c in categories)
                if total_items == 21:
                    # Check all items have video_url field
                    all_have_video_url = True
                    for cat in categories:
                        for item in cat.get("items", []):
                            if "video_url" not in item:
                                all_have_video_url = False
                                break
                        if not all_have_video_url:
                            break
                    
                    if all_have_video_url:
                        record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", True, 
                                  f"Categories: 4, Items: {total_items}, all have video_url field")
                        return True
                    else:
                        record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", False, 
                                  "Some items missing video_url field")
                else:
                    record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", False, 
                              f"Expected 21 items, got {total_items}")
            else:
                record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", False, 
                          f"Expected 4 categories, got {len(categories)}")
        else:
            record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("4. GET /api/categories returns 4 categories, 21 items with video_url", False, f"Exception: {str(e)}")
    return False

def test_5_create_media_with_video():
    """Test 5: POST /api/media with video_url → expect 200, returned item has video_url and type=video"""
    log_info("Test 5: POST /api/media with video_url field")
    try:
        payload = {
            "title": "Video Test",
            "description": "desc",
            "category_id": "c1",
            "type": "video",
            "image": "https://placehold.co/600x400",
            "video_url": "data:video/mp4;base64,AAAA",
            "year": "2025",
            "duration": "30 sec"
        }
        response = requests.post(f"{BACKEND_URL}/media", json=payload, timeout=10)
        if response.status_code == 200:
            created_item = response.json()
            video_url_ok = created_item.get("video_url") == "data:video/mp4;base64,AAAA"
            type_ok = created_item.get("type") == "video"
            
            if video_url_ok and type_ok:
                record_test("5. POST /api/media with video_url returns item with video_url and type=video", True, 
                          f"Created item ID: {created_item.get('id')}, video_url: {created_item.get('video_url')}, type: {created_item.get('type')}")
                return created_item.get("id")
            else:
                issues = []
                if not video_url_ok:
                    issues.append(f"video_url is '{created_item.get('video_url')}' not 'data:video/mp4;base64,AAAA'")
                if not type_ok:
                    issues.append(f"type is '{created_item.get('type')}' not 'video'")
                record_test("5. POST /api/media with video_url returns item with video_url and type=video", False, 
                          f"Issues: {', '.join(issues)}")
        else:
            record_test("5. POST /api/media with video_url returns item with video_url and type=video", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("5. POST /api/media with video_url returns item with video_url and type=video", False, f"Exception: {str(e)}")
    return None

def test_6_verify_video_in_categories(item_id: str):
    """Test 6: GET /api/categories → verify new item appears in c1 with video_url and type=video"""
    log_info("Test 6: Verify new video item appears in categories with video_url")
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            c1_items = next((c["items"] for c in categories if c["id"] == "c1"), [])
            found_item = next((item for item in c1_items if item.get("id") == item_id), None)
            
            if found_item:
                video_url_ok = found_item.get("video_url") == "data:video/mp4;base64,AAAA"
                type_ok = found_item.get("type") == "video"
                
                if video_url_ok and type_ok:
                    record_test("6. New video item appears in categories with video_url and type=video", True, 
                              f"Item {item_id} found with video_url and type=video")
                    return True
                else:
                    issues = []
                    if not video_url_ok:
                        issues.append(f"video_url is '{found_item.get('video_url')}'")
                    if not type_ok:
                        issues.append(f"type is '{found_item.get('type')}'")
                    record_test("6. New video item appears in categories with video_url and type=video", False, 
                              f"Issues: {', '.join(issues)}")
            else:
                record_test("6. New video item appears in categories with video_url and type=video", False, 
                          f"Item {item_id} not found in c1")
        else:
            record_test("6. New video item appears in categories with video_url and type=video", False, 
                      f"Status {response.status_code}")
    except Exception as e:
        record_test("6. New video item appears in categories with video_url and type=video", False, f"Exception: {str(e)}")
    return False

def test_7_delete_media(item_id: str):
    """Test 7: DELETE /api/media/{id} → expect {"ok": true}"""
    log_info(f"Test 7: DELETE /api/media/{item_id}")
    try:
        response = requests.delete(f"{BACKEND_URL}/media/{item_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                record_test("7. DELETE /api/media/{id} returns {ok: true}", True, 
                          f"Deleted item {item_id}")
                return True
            else:
                record_test("7. DELETE /api/media/{id} returns {ok: true}", False, 
                          f"Unexpected response: {data}")
        else:
            record_test("7. DELETE /api/media/{id} returns {ok: true}", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("7. DELETE /api/media/{id} returns {ok: true}", False, f"Exception: {str(e)}")
    return False

def test_8_update_hero_video():
    """Test 8: PUT /api/hero with video_url → expect 200 and returned hero.video_url matches"""
    log_info("Test 8: PUT /api/hero with video_url")
    try:
        payload = {"video_url": "data:video/mp4;base64,BBBB"}
        response = requests.put(f"{BACKEND_URL}/hero", json=payload, timeout=10)
        if response.status_code == 200:
            hero = response.json()
            if hero.get("video_url") == "data:video/mp4;base64,BBBB":
                record_test("8. PUT /api/hero with video_url returns updated hero", True, 
                          f"Hero video_url: {hero.get('video_url')}")
                return True
            else:
                record_test("8. PUT /api/hero with video_url returns updated hero", False, 
                          f"video_url is '{hero.get('video_url')}' not 'data:video/mp4;base64,BBBB'")
        else:
            record_test("8. PUT /api/hero with video_url returns updated hero", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("8. PUT /api/hero with video_url returns updated hero", False, f"Exception: {str(e)}")
    return False

def test_9_verify_hero_video_persisted():
    """Test 9: GET /api/hero → confirm video_url persisted"""
    log_info("Test 9: GET /api/hero - verify video_url persisted")
    try:
        response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
        if response.status_code == 200:
            hero = response.json()
            if hero.get("video_url") == "data:video/mp4;base64,BBBB":
                record_test("9. GET /api/hero confirms video_url persisted", True, 
                          f"Hero video_url: {hero.get('video_url')}")
                return True
            else:
                record_test("9. GET /api/hero confirms video_url persisted", False, 
                          f"video_url is '{hero.get('video_url')}' not 'data:video/mp4;base64,BBBB'")
        else:
            record_test("9. GET /api/hero confirms video_url persisted", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("9. GET /api/hero confirms video_url persisted", False, f"Exception: {str(e)}")
    return False

def test_10_clear_hero_video():
    """Test 10: PUT /api/hero with empty video_url → expect 200 and video_url is empty string"""
    log_info("Test 10: PUT /api/hero with empty video_url")
    try:
        payload = {"video_url": ""}
        response = requests.put(f"{BACKEND_URL}/hero", json=payload, timeout=10)
        if response.status_code == 200:
            hero = response.json()
            if hero.get("video_url") == "":
                record_test("10. PUT /api/hero with empty video_url clears it", True, 
                          f"Hero video_url: '{hero.get('video_url')}'")
                return True
            else:
                record_test("10. PUT /api/hero with empty video_url clears it", False, 
                          f"video_url is '{hero.get('video_url')}' not empty string")
        else:
            record_test("10. PUT /api/hero with empty video_url clears it", False, 
                      f"Status {response.status_code}: {response.text}")
    except Exception as e:
        record_test("10. PUT /api/hero with empty video_url clears it", False, f"Exception: {str(e)}")
    return False

def test_11_update_hero_empty_payload():
    """Test 11: PUT /api/hero with empty payload → expect 400 (no fields to update)"""
    log_info("Test 11: PUT /api/hero with empty payload")
    try:
        payload = {}
        response = requests.put(f"{BACKEND_URL}/hero", json=payload, timeout=10)
        if response.status_code == 400:
            record_test("11. PUT /api/hero with empty payload returns 400", True, 
                      f"Correctly returned 400: {response.json()}")
            return True
        else:
            record_test("11. PUT /api/hero with empty payload returns 400", False, 
                      f"Expected 400, got {response.status_code}: {response.text}")
    except Exception as e:
        record_test("11. PUT /api/hero with empty payload returns 400", False, f"Exception: {str(e)}")
    return False

def test_12_reset_and_verify():
    """Test 12: POST /api/reset → verify hero.video_url is empty and data restored"""
    log_info("Test 12: POST /api/reset and verify hero.video_url empty, data restored")
    try:
        # Reset
        response = requests.post(f"{BACKEND_URL}/reset", timeout=10)
        if response.status_code != 200:
            record_test("12. POST /api/reset restores default state", False, 
                      f"Reset failed with status {response.status_code}")
            return False
        
        # Check hero
        response = requests.get(f"{BACKEND_URL}/hero", timeout=10)
        if response.status_code == 200:
            hero = response.json()
            video_url_ok = hero.get("video_url") == ""
            backdrop_ok = "customer-assets.emergentagent.com" in hero.get("backdrop", "")
            
            if not (video_url_ok and backdrop_ok):
                issues = []
                if not video_url_ok:
                    issues.append(f"video_url is '{hero.get('video_url')}' not empty")
                if not backdrop_ok:
                    issues.append(f"backdrop doesn't contain customer-assets")
                record_test("12. POST /api/reset restores default state", False, 
                          f"Hero issues: {', '.join(issues)}")
                return False
        else:
            record_test("12. POST /api/reset restores default state", False, 
                      f"GET /api/hero failed with status {response.status_code}")
            return False
        
        # Check categories
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            total_items = sum(len(c.get("items", [])) for c in categories)
            if len(categories) == 4 and total_items == 21:
                record_test("12. POST /api/reset restores default state", True, 
                          f"Hero video_url empty, backdrop has real photo, 4 categories with 21 items")
                return True
            else:
                record_test("12. POST /api/reset restores default state", False, 
                          f"Expected 4 categories with 21 items, got {len(categories)} categories with {total_items} items")
        else:
            record_test("12. POST /api/reset restores default state", False, 
                      f"GET /api/categories failed with status {response.status_code}")
    except Exception as e:
        record_test("12. POST /api/reset restores default state", False, f"Exception: {str(e)}")
    return False

def main():
    print("=" * 80)
    print("BIRTHDAYFLIX BACKEND REGRESSION + NEW ENDPOINT TESTING")
    print(f"Testing against: {BACKEND_URL}")
    print("=" * 80)
    print()
    
    # Run tests in sequence
    test_1_reset()
    print()
    
    test_2_profiles()
    print()
    
    test_3_hero()
    print()
    
    test_4_categories()
    print()
    
    created_id = test_5_create_media_with_video()
    print()
    
    if created_id:
        test_6_verify_video_in_categories(created_id)
        print()
        
        test_7_delete_media(created_id)
        print()
    
    test_8_update_hero_video()
    print()
    
    test_9_verify_hero_video_persisted()
    print()
    
    test_10_clear_hero_video()
    print()
    
    test_11_update_hero_empty_payload()
    print()
    
    test_12_reset_and_verify()
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
