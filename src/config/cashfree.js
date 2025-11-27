// Cashfree Configuration
export const CASHFREE_CONFIG = {
    // Environment: 'sandbox' or 'production'
    environment: import.meta.env.VITE_CASHFREE_ENV || 'sandbox',

    // App ID and Secret Key (these should be stored securely on backend)
    appId: import.meta.env.VITE_CASHFREE_APP_ID || '',
    secretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY || '',

    // SDK Configuration
    sdkUrl: 'https://sdk.cashfree.com/js/v3/cashfree.js',

    // Payment Methods Configuration
    paymentMethods: {
        upi: false,
        netbanking: false,
        wallets: false,
        cards: true,
        emi: false,
        paylater: false
    },

    // Currency and Country
    currency: 'INR',
    country: 'IN'
};

// Helper function to get Cashfree mode
export const getCashfreeMode = () => {
    const env = CASHFREE_CONFIG.environment.toLowerCase();
    return env === 'prod' || env === 'production' ? 'production' : 'sandbox';
};

// Helper function to validate Cashfree configuration
export const validateCashfreeConfig = () => {

    if (!CASHFREE_CONFIG.appId) {
        console.warn('Cashfree App ID not configured. Please set VITE_CASHFREE_APP_ID in your environment variables.');
        return false;
    }

    if (!CASHFREE_CONFIG.secretKey) {
        console.warn('Cashfree Secret Key not configured. Please set VITE_CASHFREE_SECRET_KEY in your environment variables.');
        return false;
    }

    return true;
};
