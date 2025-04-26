/**
 * Product Service
 * 
 * This module combines the API calls with caching functionality
 * to provide an efficient data layer for the application.
 */

import { getProducts, getProductDetails, addToCart } from './api';
import { getFromCache, saveToCache, getCacheKey } from './cache';

/**
 * Fetches all products with caching
 * @returns {Promise<Array>} Promise that resolves to an array of products
 */
export const fetchProducts = async () => {
  // Check cache first
  const cacheKey = getCacheKey('products');
  const cachedProducts = getFromCache(cacheKey);
  
  if (cachedProducts) {
    console.log('Fetched products from cache');
    return cachedProducts;
  }
  
  // If not in cache or expired, fetch from API
  try {
    const products = await getProducts();
    
    // Save to cache
    saveToCache(cacheKey, products);
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches a specific product by ID with caching
 * @param {string|number} productId - The ID of the product to fetch
 * @returns {Promise<Object>} Promise that resolves to the product details
 */
export const fetchProductDetails = async (productId) => {
  // Check cache first
  const cacheKey = getCacheKey('product', productId);
  const cachedProduct = getFromCache(cacheKey);
  
  if (cachedProduct) {
    console.log(`Fetched product ${productId} from cache`);
    return cachedProduct;
  }
  
  // If not in cache or expired, fetch from API
  try {
    const product = await getProductDetails(productId);
    
    // Save to cache
    saveToCache(cacheKey, product);
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Adds a product to the cart (no caching for POST requests)
 * @param {Object} productData - Product data to add
 * @returns {Promise<Object>} Promise that resolves to the cart count
 */
export const addProductToCart = async (productData) => {
  try {
    return await addToCart(productData);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    throw error;
  }
};

/**
 * Gets cart count from local storage
 * @returns {number} The current cart count
 */
export const getCartCount = () => {
  try {
    const count = localStorage.getItem('cartCount');
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Updates cart count in local storage
 * @param {number} count - The new cart count
 */
export const updateCartCount = (count) => {
  try {
    localStorage.setItem('cartCount', count.toString());
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
};
