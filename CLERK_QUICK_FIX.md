# Quick Fix: Add Chrome Extension to Clerk

## The Error
You're seeing 401 errors because Clerk doesn't recognize your Chrome extension as an allowed origin.

## The Fix - Find One of These Sections:

### 1. Try "Customization" in Left Menu
- Click **Customization**
- Click **Allowlist**
- Look for **Allowed origins**

### 2. Try "Configure" in Left Menu  
- Click **Configure**
- Click **API Keys**
- Scroll to **Allowed origins**

### 3. Try "Settings" in Left Menu
- Click **Settings**
- Look for **Paths** or **URLs & Redirects**
- Find **Allowed origins**

### 4. Use Dashboard Search
- Use the search bar at the top
- Search for: **"allowed origins"**

## Once You Find It, Add This Exact URL:
```
chrome-extension://ofildlgdeggjekidmehocamopeglfmle
```

Also add for development:
```
http://localhost:5173
http://localhost:3000
```

## Can't Find It At All?

### Option 1: Contact Clerk Support
Tell them: "I need to add a Chrome extension origin to my allowed origins list but can't find the setting"

### Option 2: Use the API
```bash
curl -X PATCH https://api.clerk.com/v1/applications/YOUR_APP_ID \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "allowed_origins": [
      "chrome-extension://ofildlgdeggjekidmehocamopeglfmle",
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }'
```

### Option 3: Try Development Instance
Sometimes the setting is under a "Development" instance:
1. Look for instance/environment switcher (usually top of dashboard)
2. Switch to "Development" 
3. Then try the paths above

## Still Stuck?
1. Take a screenshot of your Clerk dashboard left menu
2. The setting exists but might be named differently in your version
3. Share the screenshot and we can identify where it is