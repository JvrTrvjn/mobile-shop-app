/**
 * API Service
 * 
 * This module contains functions to interact with the backend API.
 * All API requests are processed through these functions to centralize
 * error handling and API response formatting.
 */

const API_URL = 'https://itx-frontend-test.onrender.com';

/**
 * Fetches all products from the API
 * @returns {Promise<Array>} Promise that resolves to an array of products
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/product`);
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
};

/**
 * Fetches a specific product by ID
 * @param {string|number} productId - The ID of the product to fetch
 * @returns {Promise<Object>} Promise that resolves to the product details
 */
export const getProductDetails = async (productId) => {
  try {
    console.log(`Making API request to: ${API_URL}/api/product/${productId}`);
    
    const response = await fetch(`${API_URL}/api/product/${productId}`);
    
    if (!response.ok) {
      console.error(`API error status: ${response.status} ${response.statusText}`);
      throw new Error(`Error fetching product details: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Raw API response data:', data);
    return data;
  } catch (error) {
    console.error(`Error in getProductDetails for ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Adds a product to the cart
 * @param {Object} productData - Object containing product information
 * @param {string|number} productData.id - Product ID
 * @param {string|number} productData.colorCode - Selected color code
 * @param {string|number} productData.storageCode - Selected storage code
 * @returns {Promise<Object>} Promise that resolves to the cart count
 */
export const addToCart = async (productData) => {
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      throw new Error(`Error adding product to cart: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addToCart:', error);
    throw error;
  }
};
