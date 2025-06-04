#!/bin/bash

# Comprehensive script to fix Clerk allowed origins for Chrome extension

EXTENSION_ID=${1:-lgdnlipoamcoelcmpjfkblpblgjmogdi}
SECRET_KEY=${CLERK_SECRET_KEY:-$CLERK_SECRET_KEY_DEV}

if [ -z "$SECRET_KEY" ]; then
  echo "❌ Error: CLERK_SECRET_KEY not found"
  echo ""
  echo "Please run:"
  echo "  export CLERK_SECRET_KEY='your_sk_test_key_here'"
  echo ""
  echo "You can find your secret key at:"
  echo "  https://dashboard.clerk.com/apps/[your-app]/api-keys"
  exit 1
fi

echo "🔧 Fixing Clerk allowed origins for Chrome Extension"
echo "Extension ID: $EXTENSION_ID"
echo ""

# First, let's see what's currently set
echo "📋 Current configuration:"
CURRENT=$(curl -s -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json")

echo "$CURRENT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
origins = data.get('allowed_origins', [])
print('Current allowed origins:')
for origin in origins:
    print(f'  - {origin}')
if not origins:
    print('  (none set)')
"

echo ""
echo "🔄 Updating allowed origins..."

# Create the update payload with ALL necessary origins
cat > /tmp/clerk-update.json << EOF
{
  "allowed_origins": [
    "chrome-extension://$EXTENSION_ID",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://localhost:3000"
  ]
}
EOF

# Apply the update
RESPONSE=$(curl -s -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "Content-type: application/json" \
  -d @/tmp/clerk-update.json \
  -w "\n{\"http_code\":%{http_code}}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1 | python3 -c "import sys, json; print(json.load(sys.stdin)['http_code'])")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Successfully updated allowed origins!"
  echo ""
  echo "📋 New configuration:"
  echo "$RESPONSE" | head -n -1 | python3 -c "
import sys, json
data = json.load(sys.stdin)
origins = data.get('allowed_origins', [])
print('Allowed origins:')
for origin in origins:
    print(f'  - {origin}')
"
else
  echo "❌ Failed to update allowed origins (HTTP $HTTP_CODE)"
  echo "Response:"
  echo "$RESPONSE" | head -n -1 | python3 -m json.tool
fi

rm -f /tmp/clerk-update.json

echo ""
echo "🔍 Next steps:"
echo "1. Reload your Chrome extension"
echo "2. Try signing up again"
echo ""
echo "If you still see errors, check that your extension ID is: $EXTENSION_ID"
echo "You can verify this in chrome://extensions"