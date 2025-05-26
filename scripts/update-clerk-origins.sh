#!/bin/bash

# Update Clerk allowed origins to include the Chrome extension
# Usage: ./scripts/update-clerk-origins.sh

EXTENSION_ID="ofildlgdeggjekidmehocamopeglfmle"
CLERK_SECRET_KEY="sk_test_2Rb7WBUHRtsiyFGQZWLMWPF4DywXF1wYwX907sKkK6"

echo "Updating Clerk allowed origins..."
echo "Adding chrome-extension://${EXTENSION_ID}"

curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Content-type: application/json" \
  -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
  -d "{\"allowed_origins\": [\"chrome-extension://${EXTENSION_ID}\", \"http://localhost:3000\", \"http://localhost:5173\"]}"

echo ""
echo "Done! Clerk allowed origins updated."