#!/bin/bash

# Script to update Clerk allowed origins for Chrome extension
# Usage: ./update-clerk-origins.sh <environment> <extension-id>
# Example: ./update-clerk-origins.sh development lgdnlipoamcoelcmpjfkblpblgjmogdi

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

# Make the API call to update allowed origins
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json" \
  -d "{\"allowed_origins\": [\"$CHROME_EXTENSION_ORIGIN\"]}" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Done! Your Chrome extension should now be authorized."
echo ""
echo "Note: If you have other allowed origins, you may need to include them in the array."
echo "The API call above will replace all existing allowed origins."