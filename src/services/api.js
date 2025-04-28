const API_URL = 'https://itx-frontend-test.onrender.com';

/**
 * Trae todos los productos de la API
 * @returns {Promise<Array>} Promisa que devuelve el array de productos
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/product`);
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Trae el producto por ID de la API
 * @param {string|number} productId - El ID del producto que traer
 * @returns {Promise<Object>} Promisa que retorna el detalle del producto
 */
export const getProductDetails = async (productId) => {
  try {
    const response = await fetch(`${API_URL}/api/product/${productId}`);
    
    if (!response.ok) {
      throw new Error(`Error detalle producto API: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Adiciona el producto al carro
 * @param {Object} productData - Objeto que contiene la informacion del producto
 * @param {string|number} productData.id - Producto ID
 * @param {string|number} productData.colorCode - Seleccionar codigo de color
 * @param {string|number} productData.storageCode - Seleccionar almacenamiento de codigo
 * @returns {Promise<Object>} Promesa que retorna el contador del carro
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
      throw new Error(`Error al adicionar producto al carro: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};
