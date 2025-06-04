// Test properties data
const testProperties = [
  {
    zpid: '12345',
    address: '123 Test St, Seattle, WA 98101',
    price: '$500,000',
    beds: 3,
    baths: 2,
    sqft: '1,800',
    imageUrl: 'https://photos.zillowstatic.com/fp/test-image.jpg',
    listingUrl: 'https://www.zillow.com/homedetails/test-property-12345'
  },
  {
    zpid: '67890',
    address: '456 Demo Ave, Portland, OR 97201',
    price: '$750,000',
    beds: 4,
    baths: 3,
    sqft: '2,500',
    imageUrl: 'https://photos.zillowstatic.com/fp/test-image-2.jpg',
    listingUrl: 'https://www.zillow.com/homedetails/test-property-67890'
  },
  {
    zpid: '11111',
    address: '789 Example Rd, San Francisco, CA 94101',
    price: '$1,200,000',
    beds: 2,
    baths: 2,
    sqft: '1,200',
    imageUrl: 'https://photos.zillowstatic.com/fp/test-image-3.jpg',
    listingUrl: 'https://www.zillow.com/homedetails/test-property-11111'
  }
];

let currentFavorites = [];

function log(message, type = 'info') {
  const output = document.getElementById('output');
  const timestamp = new Date().toLocaleTimeString();
  const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
  output.innerHTML = `<span class="${className}">[${timestamp}] ${message}</span>\n${output.innerHTML}`;
}

async function testHealth() {
  log('Testing API health endpoint...');
  try {
    const response = await fetch('http://localhost:8787/health');
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ API is healthy: ${JSON.stringify(data)}`, 'success');
    } else {
      log(`❌ API health check failed: ${JSON.stringify(data)}`, 'error');
    }
  } catch (error) {
    log(`❌ Failed to reach API: ${error.message}`, 'error');
  }
}

async function getFavorites() {
  log('Getting all favorites from API...');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_FAVORITES' });
    
    if (response.success) {
      currentFavorites = response.favorites;
      log(`✅ Found ${currentFavorites.length} favorites`, 'success');
      
      if (currentFavorites.length > 0) {
        log('Favorites:');
        currentFavorites.forEach(fav => {
          log(`  - ${fav.address} (ZPID: ${fav.zpid})`);
        });
      }
      
      updateTestProperties();
    } else {
      log(`❌ Failed to get favorites: ${response.error}`, 'error');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'error');
  }
}

async function addTestFavorite() {
  // Pick a random test property
  const property = testProperties[Math.floor(Math.random() * testProperties.length)];
  
  log(`Adding test property: ${property.address}...`);
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'FAVORITE_PROPERTY',
      payload: property
    });
    
    if (response.success) {
      log(`✅ Successfully added property to favorites!`, 'success');
      // Refresh the list
      setTimeout(getFavorites, 500);
    } else {
      log(`❌ Failed to add favorite: ${response.error}`, 'error');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'error');
  }
}

async function removeFavorite(zpid) {
  log(`Removing property ${zpid} from favorites...`);
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'UNFAVORITE_PROPERTY',
      payload: { zpid }
    });
    
    if (response.success) {
      log(`✅ Successfully removed property from favorites!`, 'success');
      // Refresh the list
      setTimeout(getFavorites, 500);
    } else {
      log(`❌ Failed to remove favorite: ${response.error}`, 'error');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'error');
  }
}

async function clearAllFavorites() {
  if (!confirm('Are you sure you want to remove all favorites?')) return;
  
  log('Clearing all favorites...');
  const favoritesToRemove = [...currentFavorites];
  
  for (const fav of favoritesToRemove) {
    await removeFavorite(fav.zpid);
  }
  
  log('✅ All favorites cleared', 'success');
}

function updateTestProperties() {
  const container = document.getElementById('testProperties');
  container.innerHTML = testProperties.map(prop => {
    const isFavorited = currentFavorites.some(fav => fav.zpid === prop.zpid);
    
    return `
      <div class="test-property">
        <strong>${prop.address}</strong><br>
        ${prop.price} | ${prop.beds} beds, ${prop.baths} baths | ${prop.sqft} sqft<br>
        ZPID: ${prop.zpid}<br>
        <button onclick="${isFavorited ? `removeFavorite('${prop.zpid}')` : `addSpecificProperty('${prop.zpid}')`}">
          ${isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
        </button>
      </div>
    `;
  }).join('');
}

function addSpecificProperty(zpid) {
  const property = testProperties.find(p => p.zpid === zpid);
  if (property) {
    chrome.runtime.sendMessage({ 
      type: 'FAVORITE_PROPERTY',
      payload: property
    }).then(response => {
      if (response.success) {
        log(`✅ Added ${property.address} to favorites!`, 'success');
        setTimeout(getFavorites, 500);
      } else {
        log(`❌ Failed to add favorite: ${response.error}`, 'error');
      }
    });
  }
}

// Make functions available globally
window.removeFavorite = removeFavorite;
window.addSpecificProperty = addSpecificProperty;

// Initial load
log('🚀 No-Auth API Test Ready!', 'success');
log('Server is running in NO-AUTH mode - all requests will succeed', 'info');
setTimeout(() => {
  testHealth();
  getFavorites();
}, 500);