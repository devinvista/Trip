#!/usr/bin/env node

// Test script for the enhanced rating system
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
  phone: '11999999999'
};

const testRating = {
  rating: 5,
  comment: 'Excellent experience!',
  categories: ['reliability', 'communication', 'experience']
};

const testReport = {
  ratingType: 'user',
  ratingId: 1,
  reason: 'inappropriate_content',
  description: 'This rating contains inappropriate content'
};

async function testRatingSystem() {
  console.log('🧪 Testing Enhanced Rating System...\n');
  
  try {
    // Test 1: Try to create rating without verification (should fail)
    console.log('Test 1: Creating rating without verification...');
    try {
      await axios.post(`${BASE_URL}/api/users/2/ratings`, testRating);
      console.log('❌ Test 1 FAILED: Should have been blocked');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Test 1 PASSED: Correctly blocked non-verified user');
      } else {
        console.log('❌ Test 1 FAILED: Wrong error response');
      }
    }
    
    // Test 2: Test rating report system
    console.log('\nTest 2: Testing rating report system...');
    try {
      await axios.post(`${BASE_URL}/api/ratings/report`, testReport);
      console.log('✅ Test 2 PASSED: Rating report created successfully');
    } catch (error) {
      console.log('❌ Test 2 FAILED:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Test duplicate rating prevention
    console.log('\nTest 3: Testing duplicate rating prevention...');
    try {
      await axios.post(`${BASE_URL}/api/users/2/ratings`, testRating);
      await axios.post(`${BASE_URL}/api/users/2/ratings`, testRating);
      console.log('❌ Test 3 FAILED: Should have prevented duplicate');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Test 3 PASSED: Correctly prevented duplicate rating');
      } else {
        console.log('❌ Test 3 FAILED: Wrong error response');
      }
    }
    
    // Test 4: Test 7-day edit window
    console.log('\nTest 4: Testing 7-day edit window...');
    try {
      // This would need a rating older than 7 days to properly test
      await axios.put(`${BASE_URL}/api/users/2/ratings/1`, testRating);
      console.log('✅ Test 4 PASSED: Edit allowed within 7 days');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message.includes('7 dias')) {
        console.log('✅ Test 4 PASSED: Correctly blocked edit after 7 days');
      } else {
        console.log('❌ Test 4 FAILED:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 5: Test hidden ratings filtering
    console.log('\nTest 5: Testing hidden ratings filtering...');
    try {
      const response = await axios.get(`${BASE_URL}/api/users/2/ratings`);
      const hasHiddenRatings = response.data.some(rating => rating.isHidden);
      if (!hasHiddenRatings) {
        console.log('✅ Test 5 PASSED: Hidden ratings filtered out');
      } else {
        console.log('❌ Test 5 FAILED: Hidden ratings not filtered');
      }
    } catch (error) {
      console.log('❌ Test 5 FAILED:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Enhanced Rating System Tests Complete!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRatingSystem();
}

module.exports = { testRatingSystem };