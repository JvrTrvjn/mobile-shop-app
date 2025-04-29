// filepath: /Users/javit/Desktop/mobile-shop-app/src/services/cartService.js
import { addToCart as apiAddToCart } from './api';
import logger from '../utils/logger';

/**
 * Servicio para manejar todas las operaciones relacionadas con el carrito
 * Sigue el principio de responsabilidad única (SRP) de SOLID
 */
export class CartService {
  // Mantiene un contador en memoria
  static _localCount = 0;
  
  /**
   * Inicializa el contador del carrito desde localStorage
   * @returns {number} El contador actual del carrito
   */
  static initialize() {
    try {
      const storedCount = localStorage.getItem('cartCount');
      CartService._localCount = storedCount ? parseInt(storedCount, 10) : 0;
      return CartService._localCount;
    } catch (error) {
      logger.error('Error al inicializar contador del carrito:', error);
      return 0;
    }
  }
  
  /**
   * Añade un producto al carrito a través de la API
   * @param {Object} productData - Datos del producto para añadir al carrito
   * @param {string|number} productData.id - ID del producto
   * @param {number} productData.colorCode - Código del color seleccionado
   * @param {number} productData.storageCode - Código del almacenamiento seleccionado
   * @returns {Promise<Object>} - Respuesta de la API con el contador actualizado
   */
  static async addProduct(productData) {
    if (!productData || !productData.id || productData.colorCode === undefined || productData.storageCode === undefined) {
      throw new Error('Datos de producto incompletos');
    }
    
    try {
      const response = await apiAddToCart(productData);
      
      if (response && typeof response.count === 'number') {
        // Usamos el contador de la API, que es el valor de autoridad
        CartService._localCount = response.count;
        localStorage.setItem('cartCount', response.count.toString());
        
        // Notificamos del cambio
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return response;
      }
      
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      logger.error('Error en CartService.addProduct:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el contador actual del carrito
   * @returns {number} El contador actual del carrito
   */
  static getCount() {
    return CartService._localCount;
  }
  
  /**
   * Actualiza el contador del carrito
   * @param {number} newCount - Nuevo valor para el contador
   * @returns {number} El nuevo contador actualizado
   */
  static updateCount(newCount) {
    if (typeof newCount !== 'number' || newCount < 0) {
      logger.warn('Intento de actualizar contador con valor inválido:', newCount);
      return CartService._localCount;
    }
    
    CartService._localCount = newCount;
    localStorage.setItem('cartCount', newCount.toString());
    
    // Notificamos del cambio
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    return newCount;
  }
  
  /**
   * Incrementa el contador del carrito
   * @param {number} increment - Cantidad a incrementar
   * @returns {number} El nuevo contador actualizado
   */
  static incrementCount(increment = 1) {
    return CartService.updateCount(CartService._localCount + increment);
  }
  
  /**
   * Limpia el carrito, reiniciando el contador a cero
   * @returns {number} El contador reiniciado (0)
   */
  static clearCart() {
    return CartService.updateCount(0);
  }
}