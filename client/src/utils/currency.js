const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    AED: 'dh'
};

/**
 * Get the symbol for a given currency code. Defaults to INR (₹).
 */
export const getCurrencySymbol = (code) => {
    return currencySymbols[code] || '₹';
};

/**
 * Format a number to a currency string.
 */
export const formatPrice = (price, code = 'INR') => {
    const symbol = getCurrencySymbol(code);
    const value = typeof price === 'number' ? price : 0;
    
    // Custom formatting rule for larger numbers
    return `${symbol}${value.toLocaleString()}`;
};
