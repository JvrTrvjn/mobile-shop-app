
import { getProducts, getProductDetails, addToCart } from './api';
import { getFromCache, saveToCache, getCacheKey } from './cache';

/**
 * Trae todos los productos cacheados
 * @returns {Promise<Array>} Promisa que retorna un array de objetos
 */
export const fetchProducts = async () => {
  const cacheKey = getCacheKey('products');
  const cachedProducts = getFromCache(cacheKey);
  
  if (cachedProducts) {
    return cachedProducts;
  }
  
  try {
    const products = await getProducts();
    
    saveToCache(cacheKey, products);
    
    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Trae un producto especifico por ID cacheado
 * @param {string|number} productId - ID del producto a traer
 * @returns {Promise<Object>} Promesa que retorna los detalles del producto
 */
export const fetchProductDetails = async (productId) => {
  if (!productId || productId === 'no-id' || productId === 'undefined') {
    throw new Error('Invalid product ID');
  }
  
  const cacheKey = getCacheKey('product', String(productId));
  const cachedProduct = getFromCache(cacheKey);
  
  if (cachedProduct) {
    return cachedProduct;
  }
  
  try {
    const product = await getProductDetails(productId);
    
    saveToCache(cacheKey, product);
    
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Adiciona un producto al carro
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>} Promesa que retorna la cuenta del carro
 */
export const addProductToCart = async (productData) => {
  try {
    return await addToCart(productData);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener la cuenta del carro del local storage
 * @returns {number} La cuenta actual del carro
 */
export const getCartCount = () => {
  try {
    const count = localStorage.getItem('cartCount');
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Actualizar la cuenta del carro en el local storage
 * @param {number} count - Nueva cuenta del carro
 */
export const updateCartCount = (count) => {
  try {
    localStorage.setItem('cartCount', count.toString());
  } catch (error) {
    throw error;
  }
};
