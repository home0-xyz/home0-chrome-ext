let monitorInterval = null;

function log(message) {
  const output = document.getElementById('output');
  const timestamp = new Date().toLocaleTimeString();
  output.innerHTML = `[${timestamp}] ${message}\n${output.innerHTML}`;
}

async function checkAuthState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'DEBUG_AUTH' });
    
    if (response.serviceState?.token) {
      const tokenInfo = analyzeToken(response.serviceState.token);
      log(`Auth State:
- Authenticated: ${response.serviceState.isAuthenticated}
- Has Token: ${!!response.serviceState.token}
- Token Expires In: ${tokenInfo.expiresIn} seconds
- Token Status: ${tokenInfo.isExpired ? 'EXPIRED' : 'VALID'}
- User: ${response.serviceState.user?.email || 'N/A'}`);
    } else {
      log('No authentication token found');
    }
  } catch (error) {
    log(`Error checking auth: ${error.message}`);
  }
}

async function makeApiCall() {
  try {
    log('Making API call to /health endpoint...');
    const favorites = await chrome.runtime.sendMessage({ 
      type: 'GET_FAVORITES' 
    });
    
    if (favorites.success) {
      log(`API call successful! Found ${favorites.favorites.length} favorites`);
    } else {
      log(`API call failed: ${favorites.error}`);
      
      // Check if it was due to token expiration
      if (favorites.error.includes('401') || favorites.error.includes('expired')) {
        log('Token appears to be expired. Extension should automatically refresh...');
      }
    }
  } catch (error) {
    log(`Error making API call: ${error.message}`);
  }
}

function analyzeToken(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    return {
      exp: decoded.exp,
      now: now,
      expiresIn: expiresIn,
      isExpired: expiresIn <= 0,
      willExpireSoon: expiresIn <= 10
    };
  } catch (error) {
    return {
      error: error.message,
      isExpired: true,
      expiresIn: 0
    };
  }
}

async function simulateExpiredToken() {
  try {
    log('Simulating expired token by waiting for it to expire...');
    
    // First check current token status
    const response = await chrome.runtime.sendMessage({ type: 'DEBUG_AUTH' });
    if (!response.serviceState?.token) {
      log('No token found. Please sign in first.');
      return;
    }
    
    const tokenInfo = analyzeToken(response.serviceState.token);
    if (tokenInfo.isExpired) {
      log('Token is already expired!');
      return;
    }
    
    log(`Token will expire in ${tokenInfo.expiresIn} seconds. Waiting...`);
    
    // Wait for token to expire
    setTimeout(async () => {
      log('Token should now be expired. Making API call to trigger refresh...');
      await makeApiCall();
    }, (tokenInfo.expiresIn + 1) * 1000);
    
  } catch (error) {
    log(`Error: ${error.message}`);
  }
}

async function refreshToken() {
  try {
    log('Manually triggering token refresh...');
    await chrome.runtime.sendMessage({ type: 'REFRESH_AUTH_TOKEN' });
    log('Token refresh requested. Auth page should open shortly.');
  } catch (error) {
    log(`Error requesting refresh: ${error.message}`);
  }
}

async function monitorToken() {
  if (monitorInterval) {
    log('Monitor already running');
    return;
  }
  
  log('Starting token monitor (updates every 5 seconds)...');
  
  const checkToken = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'DEBUG_AUTH' });
    if (response.serviceState?.token) {
      const tokenInfo = analyzeToken(response.serviceState.token);
      const status = tokenInfo.isExpired ? 'EXPIRED' : 
                    tokenInfo.willExpireSoon ? 'EXPIRING SOON' : 
                    'VALID';
      log(`Token Status: ${status} (expires in ${tokenInfo.expiresIn}s)`);
    } else {
      log('No token found');
    }
  };
  
  checkToken();
  monitorInterval = setInterval(checkToken, 5000);
}

function stopMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    log('Token monitor stopped');
  } else {
    log('No monitor running');
  }
}

// Initial check
checkAuthState();