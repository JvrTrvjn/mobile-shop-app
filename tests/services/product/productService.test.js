import { expect, describe, it, vi, beforeEach } from 'vitest';
import { fetchProducts, fetchProductDetails, addProductToCart, getCartCount, updateCartCount } from '../../../src/services/productService';
import * as apiService from '../../../src/services/api';
import * as cacheService from '../../../src/services/cache';

// Mock de los servicios de API y caché
vi.mock('../../../src/services/api', () => ({
  getProducts: vi.fn(),
  getProductDetails: vi.fn(),
  addToCart: vi.fn()
}));

vi.mock('../../../src/services/cache', () => ({
  getFromCache: vi.fn(),
  saveToCache: vi.fn(),
  getCacheKey: vi.fn((resource, id) => id ? `${resource}_${id}` : resource)
}));

describe('Product Service', () => {
  // Mock de localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
  })();

  // Datos de ejemplo para tests
  const mockProducts = [
    { id: '1', brand: 'Brand1', model: 'Model1', price: 999 },
    { id: '2', brand: 'Brand2', model: 'Model2', price: 899 }
  ];

  const mockProductDetail = {
    id: '1',
    brand: 'Brand1',
    model: 'Model1',
    price: 999,
    options: {
      colors: [{ code: 1000, name: 'Black' }],
      storages: [{ code: 64, name: '64GB' }]
    }
  };

  // Setup global para todos los tests
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = localStorageMock;
    localStorageMock.clear();
    
    // Mock global de console.error para evitar mensajes en los tests
    global.console.error = vi.fn();
  });

  describe('fetchProducts', () => {
    it('devuelve los productos desde la caché si están disponibles', async () => {
      // Mock de que los productos existen en caché
      vi.mocked(cacheService.getFromCache).mockReturnValue(mockProducts);
      
      const result = await fetchProducts();
      
      // Verificar que se leyó de la caché correctamente
      expect(cacheService.getFromCache).toHaveBeenCalledWith('products');
      expect(apiService.getProducts).not.toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
    
    it('obtiene los productos de la API y los guarda en caché si no están en caché', async () => {
      // Mock de que los productos no existen en caché
      vi.mocked(cacheService.getFromCache).mockReturnValue(null);
      vi.mocked(apiService.getProducts).mockResolvedValue(mockProducts);
      
      const result = await fetchProducts();
      
      // Verificar que se llamó a la API y se guardó en caché
      expect(cacheService.getFromCache).toHaveBeenCalledWith('products');
      expect(apiService.getProducts).toHaveBeenCalled();
      expect(cacheService.saveToCache).toHaveBeenCalledWith('products', mockProducts);
      expect(result).toEqual(mockProducts);
    });
    
    it('maneja errores al obtener productos', async () => {
      // Mock de error en la API
      vi.mocked(cacheService.getFromCache).mockReturnValue(null);
      vi.mocked(apiService.getProducts).mockRejectedValue(new Error('API Error'));
      
      await expect(fetchProducts()).rejects.toThrow('No se pudieron cargar los productos');
      
      // Verificar que se llamó a la API pero no se guardó en caché
      expect(apiService.getProducts).toHaveBeenCalled();
      expect(cacheService.saveToCache).not.toHaveBeenCalled();
    });
  });
  
  describe('fetchProductDetails', () => {
    it('valida el ID del producto', async () => {
      await expect(fetchProductDetails()).rejects.toThrow('Invalid product ID');
      await expect(fetchProductDetails('no-id')).rejects.toThrow('Invalid product ID');
      await expect(fetchProductDetails('undefined')).rejects.toThrow('Invalid product ID');
    });
    
    it('devuelve los detalles del producto desde la caché si están disponibles', async () => {
      // Mock de que el producto existe en caché
      vi.mocked(cacheService.getFromCache).mockReturnValue(mockProductDetail);
      
      const result = await fetchProductDetails('1');
      
      // Verificar que se leyó de la caché correctamente
      expect(cacheService.getFromCache).toHaveBeenCalledWith('product_1');
      expect(apiService.getProductDetails).not.toHaveBeenCalled();
      expect(result).toEqual(mockProductDetail);
    });
    
    it('obtiene los detalles del producto de la API y los guarda en caché si no están en caché', async () => {
      // Mock de que el producto no existe en caché
      vi.mocked(cacheService.getFromCache).mockReturnValue(null);
      vi.mocked(apiService.getProductDetails).mockResolvedValue(mockProductDetail);
      
      const result = await fetchProductDetails('1');
      
      // Verificar que se llamó a la API y se guardó en caché
      expect(cacheService.getFromCache).toHaveBeenCalledWith('product_1');
      expect(apiService.getProductDetails).toHaveBeenCalledWith('1');
      expect(cacheService.saveToCache).toHaveBeenCalledWith('product_1', mockProductDetail);
      expect(result).toEqual(mockProductDetail);
    });
    
    it('maneja errores al obtener detalles del producto', async () => {
      // Mock de error en la API
      vi.mocked(cacheService.getFromCache).mockReturnValue(null);
      vi.mocked(apiService.getProductDetails).mockRejectedValue(new Error('API Error'));
      
      await expect(fetchProductDetails('1')).rejects.toThrow('No se pudo cargar la información del producto');
      
      // Verificar que se llamó a la API pero no se guardó en caché
      expect(apiService.getProductDetails).toHaveBeenCalledWith('1');
      expect(cacheService.saveToCache).not.toHaveBeenCalled();
    });
  });
  
  describe('addProductToCart', () => {
    const productData = { 
      id: '1', 
      colorCode: 1000, 
      storageCode: 64 
    };
    
    it('añade el producto al carrito correctamente', async () => {
      // Mock respuesta exitosa de la API
      vi.mocked(apiService.addToCart).mockResolvedValue({ count: 1 });
      
      const result = await addProductToCart(productData);
      
      // Verificar que se llamó a la API con los datos correctos
      expect(apiService.addToCart).toHaveBeenCalledWith(productData);
      expect(result).toEqual({ count: 1 });
    });
    
    it('maneja errores al añadir productos al carrito', async () => {
      // Mock error en la API
      vi.mocked(apiService.addToCart).mockRejectedValue(new Error('API Error'));
      
      await expect(addProductToCart(productData)).rejects.toThrow('No se pudo añadir el producto al carrito');
      
      // Verificar que se llamó a la API
      expect(apiService.addToCart).toHaveBeenCalledWith(productData);
    });
  });
  
  describe('getCartCount', () => {
    it('devuelve el contador del carrito desde localStorage', () => {
      // Preparar datos en localStorage
      localStorageMock.getItem.mockReturnValue('3');
      
      const result = getCartCount();
      
      // Verificar que se leyó de localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cartCount');
      expect(result).toBe(3);
    });
    
    it('devuelve 0 si no hay contador en localStorage', () => {
      // Mock localStorage vacío
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getCartCount();
      
      expect(result).toBe(0);
    });
    
    it('maneja errores al leer del localStorage', () => {
      // Simular error en localStorage
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const result = getCartCount();
      
      // Debería devolver 0 y registrar el error
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('updateCartCount', () => {
    it('actualiza el contador del carrito en localStorage', () => {
      updateCartCount(5);
      
      // Verificar que se guardó en localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cartCount', '5');
    });
    
    it('maneja errores al escribir en localStorage', () => {
      // Simular error en localStorage
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => updateCartCount(5)).toThrow('No se pudo actualizar la cantidad en el carrito');
      expect(console.error).toHaveBeenCalled();
    });
  });
});