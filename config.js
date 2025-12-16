// Google Calendar API Configuration
// IMPORTANT: Replace with your actual Google API credentials
// Get them from: https://console.cloud.google.com/apis/credentials

const GOOGLE_CONFIG = {
    // Your Google API Client ID from Google Cloud Console
    CLIENT_ID: 'mydomain-230211.apps.googleusercontent.com',
    
    // Calendar ID - use 'primary' for main calendar, or a specific calendar ID
    CALENDAR_ID: 'primary',
    
    // API Key (optional, for server-side use)
    API_KEY: 'AIzaSyDoDS2oqX8XcFXt4t-NRA0F8-VYy_Wwp90',
    
    // Scopes required
    SCOPES: 'https://www.googleapis.com/auth/calendar',
    
    // Discovery docs
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

// Check if config is set
if (GOOGLE_CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID')) {
    console.warn('⚠️ Google API credentials not configured! Please update config.js');
}

