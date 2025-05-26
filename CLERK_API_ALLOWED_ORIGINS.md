# Setting Allowed Origins Using Clerk API

Since the allowed origins setting is hard to find in the Clerk dashboard, use the API method instead.

## What You Need
1. Your Clerk **Secret Key** (starts with `sk_test_` for development)
2. Terminal/Command line access

## Step 1: Get Your Secret Key

1. Go to https://dashboard.clerk.com
2. Select your application (coherent-bear-81)
3. Navigate to **API Keys** (this should be visible in the left menu)
4. Copy your **Secret Key** (starts with `sk_test_` for development)

## Step 2: Add Allowed Origins via API

Run this command in your terminal (replace `YOUR_SECRET_KEY` with your actual secret key):

```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Content-type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -d '{
    "allowed_origins": [
      "chrome-extension://ofildlgdeggjekidmehocamopeglfmle",
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }'
```

### For Windows PowerShell:
```powershell
$headers = @{
    "Content-type" = "application/json"
    "Authorization" = "Bearer YOUR_SECRET_KEY"
}

$body = @{
    allowed_origins = @(
        "chrome-extension://ofildlgdeggjekidmehocamopeglfmle",
        "http://localhost:5173",
        "http://localhost:3000"
    )
} | ConvertTo-Json

Invoke-RestMethod -Method Patch -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Body $body
```

## Step 3: Verify It Worked

If successful, you should get a JSON response showing your instance configuration with the updated allowed_origins.

## Alternative: Add to Existing Origins

If you already have some allowed origins and want to add to them (not replace), first get current origins:

```bash
# Get current instance settings
curl -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

Then add your Chrome extension origin to the existing list.

## Quick Copy-Paste Version

Here's a ready-to-use command - just replace `YOUR_SECRET_KEY_HERE`:

```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Content-type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_KEY_HERE" \
  -d '{"allowed_origins": ["chrome-extension://ofildlgdeggjekidmehocamopeglfmle", "http://localhost:5173", "http://localhost:3000"]}'
```

## After Running the Command

1. Wait 1-2 minutes for changes to propagate
2. Reload your Chrome extension
3. Try opening the sidebar again - the 401 errors should be gone

## Troubleshooting

- **"Unauthorized" error**: Check that your secret key is correct and includes "Bearer " before it
- **"Invalid JSON" error**: Make sure the JSON format is exactly as shown
- **Still getting 401s**: Clear Chrome cache and reload the extension

## Note
According to Clerk's documentation, setting allowed_origins is **required** for Chrome extensions to work properly with Clerk authentication.