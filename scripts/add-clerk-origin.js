#!/usr/bin/env node

// Script to add Chrome extension origin to Clerk allowed origins via API
// Usage: CLERK_SECRET_KEY=sk_test_xxx node scripts/add-clerk-origin.js

// Get extension ID from command line or use the current one
const EXTENSION_ID = process.argv[2] || 'imceomkapknekhogmhpncnjhcdhimiof';
const CHROME_EXTENSION_ORIGIN = `chrome-extension://${EXTENSION_ID}`;

async function addAllowedOrigin() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY environment variable is required');
    console.error('Usage: CLERK_SECRET_KEY=sk_test_xxx node scripts/add-clerk-origin.js');
    process.exit(1);
  }

  console.log('🔧 Adding Chrome extension origin to Clerk...');
  console.log(`📍 Origin: ${CHROME_EXTENSION_ORIGIN}`);

  try {
    // First, get the current instance settings
    const instanceResponse = await fetch('https://api.clerk.com/v1/instance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!instanceResponse.ok) {
      throw new Error(`Failed to fetch instance: ${instanceResponse.status} ${await instanceResponse.text()}`);
    }

    const instance = await instanceResponse.json();
    console.log('✅ Fetched current instance settings');

    // Get current allowed origins
    const currentOrigins = instance.allowed_origins || [];
    console.log('📋 Current allowed origins:', currentOrigins);

    // Check if origin already exists
    if (currentOrigins.includes(CHROME_EXTENSION_ORIGIN)) {
      console.log('✅ Chrome extension origin already added!');
      return;
    }

    // Add the new origin
    const updatedOrigins = [...currentOrigins, CHROME_EXTENSION_ORIGIN];
    
    // Update the instance with new origins
    const updateResponse = await fetch('https://api.clerk.com/v1/instance', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        allowed_origins: updatedOrigins
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update instance: ${updateResponse.status} ${errorText}`);
    }

    const responseText = await updateResponse.text();
    console.log('Response:', responseText);
    
    if (responseText) {
      try {
        const updatedInstance = JSON.parse(responseText);
        console.log('✅ Successfully added Chrome extension origin!');
        console.log('📋 Updated allowed origins:', updatedInstance.allowed_origins);
      } catch (e) {
        console.log('✅ Origin added successfully (empty response)');
      }
    } else {
      console.log('✅ Origin added successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addAllowedOrigin();