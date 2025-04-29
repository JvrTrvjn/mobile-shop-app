import { expect, describe, it, vi, beforeEach } from 'vitest'
import {
  fetchProducts,
  fetchProductDetails,
  addProductToCart,
  getCartCount,
  updateCartCount,
} from '../../../src/services/productService'
import * as apiService from '../../../src/services/api'
import * as cacheService from '../../../src/services/cache'

vi.mock('../../../src/services/api', () => ({
  getProducts: vi.fn(),
  getProductDetails: vi.fn(),
  addToCart: vi.fn(),
}))

vi.mock('../../../src/services/cache', () => ({
  getFromCache: vi.fn(),
  saveToCache: vi.fn(),
  getCacheKey: vi.fn((resource, id) => (id ? `${resource}_${id}` : resource)),
}))

describe('Product Service', () => {
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString()
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  const mockProducts = [
    { id: '1', brand: 'Brand1', model: 'Model1', price: 999 },
    { id: '2', brand: 'Brand2', model: 'Model2', price: 899 },
  ]

  const mockProductDetail = {
    id: '1',
    brand: 'Brand1',
    model: 'Model1',
    price: 999,
    options: {
      colors: [{ code: 1000, name: 'Black' }],
      storages: [{ code: 64, name: '64GB' }],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage = localStorageMock
    localStorageMock.clear()

    global.console.error = vi.fn()
  })

  describe('fetchProducts', () => {
    it('devuelve los productos desde la caché si están disponibles', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(mockProducts)

      const result = await fetchProducts()

      expect(cacheService.getFromCache).toHaveBeenCalledWith('products')
      expect(apiService.getProducts).not.toHaveBeenCalled()
      expect(result).toEqual(mockProducts)
    })

    it('obtiene los productos de la API y los guarda en caché si no están en caché', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(null)
      vi.mocked(apiService.getProducts).mockResolvedValue(mockProducts)

      const result = await fetchProducts()

      expect(cacheService.getFromCache).toHaveBeenCalledWith('products')
      expect(apiService.getProducts).toHaveBeenCalled()
      expect(cacheService.saveToCache).toHaveBeenCalledWith('products', mockProducts)
      expect(result).toEqual(mockProducts)
    })

    it('maneja errores al obtener productos', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(null)
      vi.mocked(apiService.getProducts).mockRejectedValue(new Error('API Error'))

      await expect(fetchProducts()).rejects.toThrow('No se pudieron cargar los productos')

      expect(apiService.getProducts).toHaveBeenCalled()
      expect(cacheService.saveToCache).not.toHaveBeenCalled()
    })
  })

  describe('fetchProductDetails', () => {
    it('valida el ID del producto', async () => {
      await expect(fetchProductDetails()).rejects.toThrow('Invalid product ID')
      await expect(fetchProductDetails('no-id')).rejects.toThrow('Invalid product ID')
      await expect(fetchProductDetails('undefined')).rejects.toThrow('Invalid product ID')
    })

    it('devuelve los detalles del producto desde la caché si están disponibles', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(mockProductDetail)

      const result = await fetchProductDetails('1')

      expect(cacheService.getFromCache).toHaveBeenCalledWith('product_1')
      expect(apiService.getProductDetails).not.toHaveBeenCalled()
      expect(result).toEqual(mockProductDetail)
    })

    it('obtiene los detalles del producto de la API y los guarda en caché si no están en caché', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(null)
      vi.mocked(apiService.getProductDetails).mockResolvedValue(mockProductDetail)

      const result = await fetchProductDetails('1')

      expect(cacheService.getFromCache).toHaveBeenCalledWith('product_1')
      expect(apiService.getProductDetails).toHaveBeenCalledWith('1')
      expect(cacheService.saveToCache).toHaveBeenCalledWith('product_1', mockProductDetail)
      expect(result).toEqual(mockProductDetail)
    })

    it('maneja errores al obtener detalles del producto', async () => {
      vi.mocked(cacheService.getFromCache).mockReturnValue(null)
      vi.mocked(apiService.getProductDetails).mockRejectedValue(new Error('API Error'))

      await expect(fetchProductDetails('1')).rejects.toThrow(
        'No se pudo cargar la información del producto'
      )

      expect(apiService.getProductDetails).toHaveBeenCalledWith('1')
      expect(cacheService.saveToCache).not.toHaveBeenCalled()
    })
  })

  describe('addProductToCart', () => {
    const productData = {
      id: '1',
      colorCode: 1000,
      storageCode: 64,
    }

    it('añade el producto al carrito correctamente', async () => {
      vi.mocked(apiService.addToCart).mockResolvedValue({ count: 1 })

      const result = await addProductToCart(productData)

      expect(apiService.addToCart).toHaveBeenCalledWith(productData)
      expect(result).toEqual({ count: 1 })
    })

    it('maneja errores al añadir productos al carrito', async () => {
      vi.mocked(apiService.addToCart).mockRejectedValue(new Error('API Error'))

      await expect(addProductToCart(productData)).rejects.toThrow(
        'No se pudo añadir el producto al carrito'
      )

      expect(apiService.addToCart).toHaveBeenCalledWith(productData)
    })
  })

  describe('getCartCount', () => {
    it('devuelve el contador del carrito desde localStorage', () => {
      localStorageMock.getItem.mockReturnValue('3')

      const result = getCartCount()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cartCount')
      expect(result).toBe(3)
    })

    it('devuelve 0 si no hay contador en localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = getCartCount()

      expect(result).toBe(0)
    })

    it('maneja errores al leer del localStorage', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = getCartCount()

      expect(result).toBe(0)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('updateCartCount', () => {
    it('actualiza el contador del carrito en localStorage', () => {
      updateCartCount(5)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('cartCount', '5')
    })

    it('maneja errores al escribir en localStorage', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => updateCartCount(5)).toThrow('No se pudo actualizar la cantidad en el carrito')
      expect(console.error).toHaveBeenCalled()
    })
  })
})

describe('Product Service - Tests Simplificados', () => {
  const mockStorage = {}
  const simpleStorageMock = {
    getItem: vi.fn(key => mockStorage[key] || null),
    setItem: vi.fn((key, value) => {
      mockStorage[key] = value.toString()
    }),
    clear: vi.fn(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    }),
  }

  const testProducts = [
    { id: '1', brand: 'Apple', model: 'iPhone 13', price: 999 },
    { id: '2', brand: 'Samsung', model: 'Galaxy S21', price: 899 },
  ]

  const testProductDetail = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    options: {
      colors: [{ code: 1000, name: 'Negro' }],
      storages: [{ code: 64, name: '64GB' }],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    Object.defineProperty(global, 'localStorage', {
      value: simpleStorageMock,
      writable: true,
    })

    vi.mocked(cacheService.getFromCache).mockImplementation(() => null)
    vi.mocked(apiService.getProducts).mockResolvedValue(testProducts)
    vi.mocked(apiService.getProductDetails).mockResolvedValue(testProductDetail)
  })

  it('fetchProducts recupera productos de la API cuando no hay caché', async () => {
    vi.mocked(cacheService.getFromCache).mockReturnValue(null)

    const products = await fetchProducts()

    expect(cacheService.getFromCache).toHaveBeenCalledWith('products')
    expect(apiService.getProducts).toHaveBeenCalled()
    expect(products).toEqual(testProducts)
  })

  it('fetchProductDetails recupera detalles de la API cuando no hay caché', async () => {
    vi.mocked(cacheService.getFromCache).mockReturnValue(null)

    const product = await fetchProductDetails('1')

    expect(cacheService.getFromCache).toHaveBeenCalledWith('product_1')
    expect(apiService.getProductDetails).toHaveBeenCalledWith('1')
    expect(product).toEqual(testProductDetail)
  })

  it('getCartCount y updateCartCount funcionan correctamente', () => {
    simpleStorageMock.getItem.mockReturnValue(null)
    expect(getCartCount()).toBe(0)

    updateCartCount(3)

    expect(simpleStorageMock.setItem).toHaveBeenCalledWith('cartCount', '3')

    simpleStorageMock.getItem.mockReturnValue('3')

    expect(getCartCount()).toBe(3)
  })
})
