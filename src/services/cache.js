/**
 * Cache Service
 * 
 * This module handles client-side caching of API responses to reduce
 * the number of API calls. Data is stored in localStorage with a 1-hour
 * expiration time as specified in the requirements.
 */

// Expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000;

/**
 * Gets data from cache
 * @param {string} key - The cache key
 * @returns {any|null} The cached data if valid, null otherwise
 */
export const getFromCache = (key) => {
  try {
    const cachedData = localStorage.getItem(key);
    
    if (!cachedData) {
      return null;
    }
    
    const parsedData = JSON.parse(cachedData);
    
    // Check if the data has expired
    if (Date.now() > parsedData.expiry) {
      // Data has expired, remove it from cache
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Error retrieving data from cache:', error);
    return null;
  }
};

/**
 * Saves data to cache with expiration time
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 */
export const saveToCache = (key, data) => {
  try {
    const cacheObject = {
      data,
      expiry: Date.now() + CACHE_EXPIRATION
    };
    
    localStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Error saving data to cache:', error);
  }
};

/**
 * Generates a cache key for a specific resource
 * @param {string} resourceType - Type of resource (e.g., 'products', 'product')
 * @param {string|null} id - Optional ID for the resource
 * @returns {string} The cache key
 */
export const getCacheKey = (resourceType, id = null) => {
  return id ? `${resourceType}_${id}` : resourceType;
};

/**
 * Clears all cached data
 */
export const clearCache = () => {
  try {
    // Only clear keys that are related to our application
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('products') || key.startsWith('product_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
