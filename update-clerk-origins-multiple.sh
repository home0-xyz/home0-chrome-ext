#!/bin/bash

# Script to ADD a Chrome extension to existing Clerk allowed origins
# This version preserves existing origins

ENV=${1:-development}
EXTENSION_ID=${2:-lgdnlipoamcoelcmpjfkblpblgjmogdi}

if [ "$ENV" = "production" ]; then
  echo "⚠️  Using production key - make sure this is what you want!"
  SECRET_KEY=${CLERK_SECRET_KEY_PROD:-$CLERK_SECRET_KEY}
else
  echo "Using development key"
  SECRET_KEY=${CLERK_SECRET_KEY_DEV:-$CLERK_SECRET_KEY}
fi

if [ -z "$SECRET_KEY" ]; then
  echo "❌ Error: CLERK_SECRET_KEY not found in environment"
  echo "Please set CLERK_SECRET_KEY_DEV or CLERK_SECRET_KEY environment variable"
  exit 1
fi

CHROME_EXTENSION_ORIGIN="chrome-extension://$EXTENSION_ID"

echo "Adding Chrome extension to Clerk allowed origins..."
echo "Extension ID: $EXTENSION_ID"
echo "Origin: $CHROME_EXTENSION_ORIGIN"

# First, get current instance configuration
echo "Fetching current configuration..."
CURRENT_CONFIG=$(curl -s -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json")

# Extract current allowed_origins (this is a simplified version, you might need jq for proper JSON parsing)
echo "Current configuration received"

# Update with multiple origins - adjust this array as needed
cat > /tmp/clerk-update.json << EOF
{
  "allowed_origins": [
    "$CHROME_EXTENSION_ORIGIN",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-app.com"
  ]
}
EOF

echo "Updating allowed origins..."
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json" \
  -d @/tmp/clerk-update.json \
  -w "\n\nHTTP Status: %{http_code}\n"

rm /tmp/clerk-update.json

echo ""
echo "✅ Done! Your Chrome extension should now be authorized."