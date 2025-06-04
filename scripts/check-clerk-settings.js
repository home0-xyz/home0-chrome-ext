#!/usr/bin/env node

// Script to check all Clerk settings that might affect sign-up
// Usage: CLERK_SECRET_KEY=sk_test_xxx node scripts/check-clerk-settings.js

async function checkClerkSettings() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🔍 Checking Clerk settings...\n');

  try {
    // 1. Check instance settings
    console.log('1️⃣ Instance Settings:');
    const instanceResponse = await fetch('https://api.clerk.com/v1/instance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });
    const instance = await instanceResponse.json();
    
    console.log('  Allowed origins:', instance.allowed_origins);
    console.log('  Home URL:', instance.home_url);
    console.log('  Sign-in URL:', instance.sign_in_url);
    console.log('  Sign-up URL:', instance.sign_up_url);
    console.log('  Redirect URLs:', instance.redirect_urls);
    
    // 2. Check sign-up settings
    console.log('\n2️⃣ Sign-up Settings:');
    console.log('  Email verification:', instance.email_verification_required);
    console.log('  Password required:', instance.password_required);
    console.log('  Username required:', instance.username_required);
    console.log('  Phone required:', instance.phone_number_required);
    
    // 3. Check security settings
    console.log('\n3️⃣ Security Settings:');
    console.log('  Enhanced email deliverability:', instance.enhanced_email_deliverability);
    console.log('  Test mode:', instance.test_mode);
    
    // 4. Check allowlist settings
    console.log('\n4️⃣ Allowlist Configuration:');
    const allowlistResponse = await fetch('https://api.clerk.com/v1/allowlist', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });
    
    if (allowlistResponse.ok) {
      const allowlist = await allowlistResponse.json();
      console.log('  Allowlist enabled:', allowlist.length > 0);
      if (allowlist.length > 0) {
        console.log('  Allowed identifiers:', allowlist.map(a => a.identifier));
      }
    }
    
    // 5. Check blocklist settings
    console.log('\n5️⃣ Blocklist Configuration:');
    const blocklistResponse = await fetch('https://api.clerk.com/v1/blocklist', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });
    
    if (blocklistResponse.ok) {
      const blocklist = await blocklistResponse.json();
      console.log('  Blocklist enabled:', blocklist.length > 0);
      if (blocklist.length > 0) {
        console.log('  Blocked identifiers:', blocklist.map(b => b.identifier));
      }
    }
    
    console.log('\n✅ Settings check complete!');
    
    // Recommendations
    console.log('\n📋 Recommendations:');
    console.log('  - Ensure chrome-extension://imceomkapknekhogmhpncnjhcdhimiof is in allowed origins');
    console.log('  - Check if email verification is causing issues');
    console.log('  - Verify no allowlist/blocklist restrictions are blocking sign-ups');
    console.log('  - Consider enabling test mode for development');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkClerkSettings();