#!/usr/bin/env node

// Test Clerk sign-up directly via API
// This helps identify if the issue is with the Chrome extension context

const CLERK_FRONTEND_API = 'https://coherent-bear-81.clerk.accounts.dev';

async function testSignUp() {
  console.log('🧪 Testing Clerk sign-up via API...\n');

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // 1. Create a sign-up attempt
    console.log('1️⃣ Creating sign-up attempt...');
    const signUpResponse = await fetch(`${CLERK_FRONTEND_API}/v1/client/sign_ups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://imceomkapknekhogmhpncnjhcdhimiof',
      },
      body: JSON.stringify({
        email_address: testEmail,
        password: testPassword,
      }),
    });

    console.log('Response status:', signUpResponse.status);
    console.log('Response headers:', Object.fromEntries(signUpResponse.headers.entries()));
    
    const responseText = await signUpResponse.text();
    console.log('Response body:', responseText);

    if (!signUpResponse.ok) {
      console.log('\n❌ Sign-up failed with status:', signUpResponse.status);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', JSON.stringify(errorData, null, 2));
        
        if (errorData.errors) {
          errorData.errors.forEach(error => {
            console.log(`\n🚫 Error: ${error.message}`);
            console.log(`   Code: ${error.code}`);
            console.log(`   Meta: ${JSON.stringify(error.meta)}`);
          });
        }
      } catch (e) {
        console.log('Raw error:', responseText);
      }
    } else {
      console.log('\n✅ Sign-up request succeeded!');
      const data = JSON.parse(responseText);
      console.log('Sign-up ID:', data.id);
      console.log('Status:', data.status);
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }

  console.log('\n📋 Debugging tips:');
  console.log('  - If you see "failed security validations", it means Clerk is blocking the request');
  console.log('  - Check if the origin header is being accepted');
  console.log('  - Try different user agents or headers');
  console.log('  - Consider using Clerk\'s test mode');
}

testSignUp();