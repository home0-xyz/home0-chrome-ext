#!/bin/bash

# Script to check current Clerk instance configuration
# This will show us what allowed origins are currently set

SECRET_KEY=${CLERK_SECRET_KEY:-$CLERK_SECRET_KEY_DEV}

if [ -z "$SECRET_KEY" ]; then
  echo "❌ Error: CLERK_SECRET_KEY not found in environment"
  echo "Please set CLERK_SECRET_KEY or CLERK_SECRET_KEY_DEV environment variable"
  exit 1
fi

echo "Fetching current Clerk instance configuration..."
echo ""

# Get current instance configuration
curl -s -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json" | python3 -m json.tool

echo ""
echo "Look for 'allowed_origins' in the output above."
echo "Your Chrome extension origin should be listed there."