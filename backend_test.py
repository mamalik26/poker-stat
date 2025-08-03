#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Poker Probability Calculator
Tests all endpoints with various scenarios including edge cases and performance testing.
"""

import requests
import json
import time
import os
from typing import Dict, Any, List

# Get backend URL from environment
BACKEND_URL = "https://86fa4beb-2f95-4b09-9924-af4fde58ca53.preview.emergentagent.com/api"

class PokerAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        
    def test_basic_health_check(self):
        """Test GET /api/ endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("GET /api/ - Basic health check", True, f"Response: {data}")
                else:
                    self.log_test("GET /api/ - Basic health check", False, "Missing expected fields in response")
            else:
                self.log_test("GET /api/ - Basic health check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/ - Basic health check", False, f"Exception: {str(e)}")
    
    def test_health_endpoint(self):
        """Test GET /api/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["status", "engine", "database"]
                if all(field in data for field in required_fields):
                    self.log_test("GET /api/health - Health status check", True, f"Response: {data}")
                else:
                    self.log_test("GET /api/health - Health status check", False, "Missing required health fields")
            else:
                self.log_test("GET /api/health - Health status check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health - Health status check", False, f"Exception: {str(e)}")
    
    def test_hand_rankings(self):
        """Test GET /api/hand-rankings endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/hand-rankings")
            if response.status_code == 200:
                data = response.json()
                if "rankings" in data and len(data["rankings"]) == 10:
                    # Check if all rankings have required fields
                    valid_rankings = all(
                        "rank" in ranking and "name" in ranking and "description" in ranking
                        for ranking in data["rankings"]
                    )
                    if valid_rankings:
                        self.log_test("GET /api/hand-rankings - Hand rankings reference", True, "All 10 rankings present with required fields")
                    else:
                        self.log_test("GET /api/hand-rankings - Hand rankings reference", False, "Rankings missing required fields")
                else:
                    self.log_test("GET /api/hand-rankings - Hand rankings reference", False, "Invalid rankings structure")
            else:
                self.log_test("GET /api/hand-rankings - Hand rankings reference", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/hand-rankings - Hand rankings reference", False, f"Exception: {str(e)}")
    
    def test_analyze_hand_preflop(self):
        """Test POST /api/analyze-hand with pre-flop scenario"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [None, None, None, None, None],
            "player_count": 3,
            "simulation_iterations": 50000
        }
        
        try:
            start_time = time.time()
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["win_probability", "tie_probability", "lose_probability", 
                                 "hand_strength", "opponent_ranges", "recommendation", "calculations"]
                
                if all(field in data for field in required_fields):
                    # Check probability sum
                    total_prob = data["win_probability"] + data["tie_probability"] + data["lose_probability"]
                    prob_valid = 99.0 <= total_prob <= 101.0  # Allow small rounding errors
                    
                    # Check response time
                    response_time = end_time - start_time
                    time_valid = response_time < 2.0
                    
                    if prob_valid and time_valid:
                        self.log_test("POST /api/analyze-hand - Pre-flop AK", True, 
                                    f"Win: {data['win_probability']}%, Time: {response_time:.2f}s")
                    else:
                        issues = []
                        if not prob_valid:
                            issues.append(f"Probability sum: {total_prob}%")
                        if not time_valid:
                            issues.append(f"Response time: {response_time:.2f}s")
                        self.log_test("POST /api/analyze-hand - Pre-flop AK", False, "; ".join(issues))
                else:
                    self.log_test("POST /api/analyze-hand - Pre-flop AK", False, "Missing required response fields")
            else:
                self.log_test("POST /api/analyze-hand - Pre-flop AK", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Pre-flop AK", False, f"Exception: {str(e)}")
    
    def test_analyze_hand_flop(self):
        """Test POST /api/analyze-hand with flop scenario"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [
                {"rank": "Q", "suit": "diamonds"},
                {"rank": "J", "suit": "clubs"},
                {"rank": "10", "suit": "hearts"},
                None,
                None
            ],
            "player_count": 3,
            "simulation_iterations": 100000
        }
        
        try:
            start_time = time.time()
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                # This should be a straight, so win probability should be very high
                win_prob = data["win_probability"]
                response_time = end_time - start_time
                
                if win_prob > 80 and response_time < 2.0:
                    self.log_test("POST /api/analyze-hand - Flop straight", True, 
                                f"Win: {win_prob}%, Time: {response_time:.2f}s")
                else:
                    self.log_test("POST /api/analyze-hand - Flop straight", False, 
                                f"Win: {win_prob}%, Time: {response_time:.2f}s")
            else:
                self.log_test("POST /api/analyze-hand - Flop straight", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Flop straight", False, f"Exception: {str(e)}")
    
    def test_analyze_hand_turn(self):
        """Test POST /api/analyze-hand with turn scenario"""
        payload = {
            "hole_cards": [
                {"rank": "7", "suit": "hearts"},
                {"rank": "8", "suit": "hearts"}
            ],
            "community_cards": [
                {"rank": "9", "suit": "hearts"},
                {"rank": "10", "suit": "spades"},
                {"rank": "J", "suit": "diamonds"},
                {"rank": "2", "suit": "clubs"},
                None
            ],
            "player_count": 4,
            "simulation_iterations": 75000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code == 200:
                data = response.json()
                # This is a straight, should have high win probability
                win_prob = data["win_probability"]
                if win_prob > 70:
                    self.log_test("POST /api/analyze-hand - Turn straight", True, f"Win: {win_prob}%")
                else:
                    self.log_test("POST /api/analyze-hand - Turn straight", False, f"Win: {win_prob}%")
            else:
                self.log_test("POST /api/analyze-hand - Turn straight", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Turn straight", False, f"Exception: {str(e)}")
    
    def test_analyze_hand_river(self):
        """Test POST /api/analyze-hand with river scenario"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "hearts"},
                {"rank": "A", "suit": "spades"}
            ],
            "community_cards": [
                {"rank": "A", "suit": "diamonds"},
                {"rank": "K", "suit": "clubs"},
                {"rank": "Q", "suit": "hearts"},
                {"rank": "J", "suit": "spades"},
                {"rank": "2", "suit": "diamonds"}
            ],
            "player_count": 2,
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code == 200:
                data = response.json()
                # This is three aces, should have very high win probability
                win_prob = data["win_probability"]
                if win_prob > 85:
                    self.log_test("POST /api/analyze-hand - River three aces", True, f"Win: {win_prob}%")
                else:
                    self.log_test("POST /api/analyze-hand - River three aces", False, f"Win: {win_prob}%")
            else:
                self.log_test("POST /api/analyze-hand - River three aces", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - River three aces", False, f"Exception: {str(e)}")
    
    def test_duplicate_cards_error(self):
        """Test duplicate cards should return 400 error"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "A", "suit": "spades"}  # Duplicate card
            ],
            "community_cards": [None, None, None, None, None],
            "player_count": 2,
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code == 400:
                self.log_test("POST /api/analyze-hand - Duplicate cards error", True, "Correctly returned 400 error")
            else:
                self.log_test("POST /api/analyze-hand - Duplicate cards error", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Duplicate cards error", False, f"Exception: {str(e)}")
    
    def test_invalid_card_format_error(self):
        """Test invalid card format should return 400 error"""
        payload = {
            "hole_cards": [
                {"rank": "X", "suit": "spades"},  # Invalid rank
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [None, None, None, None, None],
            "player_count": 2,
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code in [400, 422]:  # 422 for validation errors
                self.log_test("POST /api/analyze-hand - Invalid card format error", True, "Correctly returned error")
            else:
                self.log_test("POST /api/analyze-hand - Invalid card format error", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Invalid card format error", False, f"Exception: {str(e)}")
    
    def test_missing_hole_cards_error(self):
        """Test missing hole cards should return 400 error"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"}  # Only one hole card
            ],
            "community_cards": [None, None, None, None, None],
            "player_count": 2,
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code == 400:
                self.log_test("POST /api/analyze-hand - Missing hole cards error", True, "Correctly returned 400 error")
            else:
                self.log_test("POST /api/analyze-hand - Missing hole cards error", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Missing hole cards error", False, f"Exception: {str(e)}")
    
    def test_too_many_community_cards_error(self):
        """Test too many community cards should return 400 error"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [
                {"rank": "Q", "suit": "diamonds"},
                {"rank": "J", "suit": "clubs"},
                {"rank": "10", "suit": "hearts"},
                {"rank": "9", "suit": "spades"},
                {"rank": "8", "suit": "diamonds"},
                {"rank": "7", "suit": "clubs"}  # 6 community cards (too many)
            ],
            "player_count": 2,
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code == 400:
                self.log_test("POST /api/analyze-hand - Too many community cards error", True, "Correctly returned 400 error")
            else:
                self.log_test("POST /api/analyze-hand - Too many community cards error", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Too many community cards error", False, f"Exception: {str(e)}")
    
    def test_invalid_player_count_error(self):
        """Test invalid player count should return validation error"""
        payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [None, None, None, None, None],
            "player_count": 15,  # Too many players
            "simulation_iterations": 10000
        }
        
        try:
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            if response.status_code in [400, 422]:
                self.log_test("POST /api/analyze-hand - Invalid player count error", True, "Correctly returned validation error")
            else:
                self.log_test("POST /api/analyze-hand - Invalid player count error", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - Invalid player count error", False, f"Exception: {str(e)}")
    
    def test_high_iteration_performance(self):
        """Test high iteration count performance"""
        payload = {
            "hole_cards": [
                {"rank": "K", "suit": "spades"},
                {"rank": "Q", "suit": "hearts"}
            ],
            "community_cards": [
                {"rank": "J", "suit": "diamonds"},
                None, None, None, None
            ],
            "player_count": 6,
            "simulation_iterations": 100000  # High iteration count
        }
        
        try:
            start_time = time.time()
            response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
            end_time = time.time()
            
            if response.status_code == 200:
                response_time = end_time - start_time
                if response_time < 2.0:  # Should complete in under 2 seconds
                    self.log_test("POST /api/analyze-hand - High iteration performance", True, 
                                f"100k iterations completed in {response_time:.2f}s")
                else:
                    self.log_test("POST /api/analyze-hand - High iteration performance", False, 
                                f"Too slow: {response_time:.2f}s")
            else:
                self.log_test("POST /api/analyze-hand - High iteration performance", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/analyze-hand - High iteration performance", False, f"Exception: {str(e)}")
    
    def test_different_player_counts(self):
        """Test different player counts (2-10 players)"""
        base_payload = {
            "hole_cards": [
                {"rank": "A", "suit": "spades"},
                {"rank": "K", "suit": "hearts"}
            ],
            "community_cards": [None, None, None, None, None],
            "simulation_iterations": 25000
        }
        
        passed_counts = []
        failed_counts = []
        
        for player_count in [2, 4, 6, 8, 10]:
            payload = base_payload.copy()
            payload["player_count"] = player_count
            
            try:
                response = self.session.post(f"{self.base_url}/analyze-hand", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    # Check that opponent ranges match player count
                    expected_opponents = min(player_count - 1, 4)  # Max 4 opponent profiles
                    actual_opponents = len(data.get("opponent_ranges", []))
                    
                    if actual_opponents == expected_opponents:
                        passed_counts.append(player_count)
                    else:
                        failed_counts.append(f"{player_count} players (expected {expected_opponents} opponents, got {actual_opponents})")
                else:
                    failed_counts.append(f"{player_count} players (status {response.status_code})")
            except Exception as e:
                failed_counts.append(f"{player_count} players (exception: {str(e)})")
        
        if not failed_counts:
            self.log_test("POST /api/analyze-hand - Different player counts", True, 
                        f"All player counts work: {passed_counts}")
        else:
            self.log_test("POST /api/analyze-hand - Different player counts", False, 
                        f"Failed: {failed_counts}")
    
    def run_all_tests(self):
        """Run all tests and return summary"""
        print("🃏 Starting Poker API Backend Tests...")
        print(f"Testing backend at: {self.base_url}")
        print("=" * 60)
        
        # Basic endpoint tests
        self.test_basic_health_check()
        self.test_health_endpoint()
        self.test_hand_rankings()
        
        # Valid poker scenarios
        self.test_analyze_hand_preflop()
        self.test_analyze_hand_flop()
        self.test_analyze_hand_turn()
        self.test_analyze_hand_river()
        
        # Edge case and error handling tests
        self.test_duplicate_cards_error()
        self.test_invalid_card_format_error()
        self.test_missing_hole_cards_error()
        self.test_too_many_community_cards_error()
        self.test_invalid_player_count_error()
        
        # Performance and functionality tests
        self.test_high_iteration_performance()
        self.test_different_player_counts()
        
        # Summary
        print("=" * 60)
        passed = sum(1 for result in self.test_results if result["passed"])
        total = len(self.test_results)
        print(f"📊 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
        else:
            print("⚠️  Some tests failed. Check details above.")
            failed_tests = [result for result in self.test_results if not result["passed"]]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  ❌ {test['test']}: {test['details']}")
        
        return {
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": (passed / total) * 100 if total > 0 else 0,
            "all_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = PokerAPITester(BACKEND_URL)
    results = tester.run_all_tests()
    
    # Return exit code based on results
    if results["failed_tests"] == 0:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()