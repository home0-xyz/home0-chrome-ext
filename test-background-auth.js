function log(message, isError = false) {
  const output = document.getElementById('output');
  const timestamp = new Date().toLocaleTimeString();
  const className = isError ? 'error' : 'success';
  output.innerHTML = `<span class="${className}">[${timestamp}] ${message}</span>\n${output.innerHTML}`;
}

async function testBackgroundToken() {
  try {
    log('Requesting token from background service...');
    const response = await chrome.runtime.sendMessage({ type: 'GET_CLERK_TOKEN' });
    
    if (response.success && response.token) {
      log(`✅ Got fresh token from background! Token length: ${response.token.length}`);
      
      // Analyze the token
      try {
        const [, payload] = response.token.split('.');
        const decoded = JSON.parse(atob(payload));
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        log(`Token expires in: ${expiresIn} seconds`);
      } catch (e) {
        log('Could not decode token expiration');
      }
    } else {
      log(`❌ Failed to get token: ${response.error || 'Unknown error'}`, true);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, true);
  }
}

async function testApiCall() {
  try {
    log('Testing API call with background token...');
    
    // This will use the background token automatically
    const response = await chrome.runtime.sendMessage({ 
      type: 'GET_FAVORITES' 
    });
    
    if (response.success) {
      log(`✅ API call successful! Found ${response.favorites.length} favorites`);
    } else {
      log(`❌ API call failed: ${response.error}`, true);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, true);
  }
}

async function checkAuthState() {
  try {
    log('Checking authentication state...');
    
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    
    if (response.isAuthenticated) {
      log('✅ User is authenticated');
      
      // Get more details
      const debugResponse = await chrome.runtime.sendMessage({ type: 'DEBUG_AUTH' });
      if (debugResponse.serviceState?.user) {
        log(`User email: ${debugResponse.serviceState.user.email || 'N/A'}`);
      }
    } else {
      log('❌ User is not authenticated', true);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, true);
  }
}

// Initial check
checkAuthState();