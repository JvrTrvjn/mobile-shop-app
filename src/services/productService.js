import { getProducts, getProductDetails, addToCart } from './api'
import { getFromCache, saveToCache, getCacheKey } from './cache'

/**
 * Trae todos los productos cacheados
 * @returns {Promise<Array>} Promisa que retorna un array de objetos
 */
export const fetchProducts = async () => {
  const cacheKey = getCacheKey('products')
  const cachedProducts = getFromCache(cacheKey)

  if (cachedProducts) {
    return cachedProducts
  }

  try {
    const products = await getProducts()

    saveToCache(cacheKey, products)

    return products
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al recuperar los productos:', error)
    }

    throw new Error('No se pudieron cargar los productos. Intenta más tarde.')
  }
}

/**
 * Trae un producto especifico por ID cacheado
 * @param {string|number} productId - ID del producto a traer
 * @returns {Promise<Object>} Promesa que retorna los detalles del producto
 */
export const fetchProductDetails = async productId => {
  if (!productId || productId === 'no-id' || productId === 'undefined') {
    throw new Error('Invalid product ID')
  }
  
  // Asegurarse de que el productId sea una cadena válida
  const validProductId = String(productId).trim();
  console.log('Fetching product with ID:', validProductId);
  
  // Generar una clave de caché única para este producto
  const cacheKey = getCacheKey('product', validProductId);
  console.log('Cache key generated:', cacheKey);
  
  // Intentar obtener el producto del caché
  const cachedProduct = getFromCache(cacheKey);
  
  if (cachedProduct) {
    console.log('Product found in cache:', cachedProduct.brand, cachedProduct.model);
    return cachedProduct;
  }

  try {
    const product = await getProductDetails(validProductId)
    
    if (product) {
      console.log('Product received from API:', product.brand, product.model);
      // Guardar en caché usando la clave única generada anteriormente
      saveToCache(cacheKey, product);
      console.log('Product saved to cache with key:', cacheKey);
    } else {
      console.error('Received null or undefined product from API');
    }

    return product
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error al obtener los detalles del producto ${productId}:`, error)
    }

    throw new Error('No se pudo cargar la información del producto. Intenta más tarde.')
  }
}

/**
 * Adiciona un producto al carro
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>} Promesa que retorna la cuenta del carro
 */
export const addProductToCart = async productData => {
  try {
    return await addToCart(productData)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al añadir producto al carrito:', error)
    }

    throw new Error('No se pudo añadir el producto al carrito. Intenta más tarde.')
  }
}

/**
 * Obtener la cuenta del carro del local storage
 * @returns {number} La cuenta actual del carro
 */
export const getCartCount = () => {
  try {
    const count = localStorage.getItem('cartCount')
    return count ? parseInt(count, 10) : 0
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al obtener la cantidad del carrito:', error)
    }

    return 0
  }
}

/**
 * Actualizar la cuenta del carro en el local storage
 * @param {number} count - Nueva cuenta del carro
 */
export const updateCartCount = count => {
  try {
    localStorage.setItem('cartCount', count.toString())
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al actualizar la cantidad del carrito:', error)
    }

    throw new Error('No se pudo actualizar la cantidad en el carrito. Intenta más tarde.')
  }
}
