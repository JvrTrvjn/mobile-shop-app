import { expect, describe, it, vi, beforeEach } from 'vitest'
import { getFromCache, saveToCache, getCacheKey, clearCache } from '../../src/services/cache'

describe('Cache Service', () => {
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value
      }),
      removeItem: vi.fn(key => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
      key: vi.fn(index => {
        return Object.keys(store)[index] || null
      }),
      get length() {
        return Object.keys(store).length
      },
    }
  })()

  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage = localStorageMock
    global.Date.now = vi.fn(() => 1619766000000)
    localStorageMock.clear()
  })

  describe('getFromCache', () => {
    it('devuelve null si no hay datos en caché', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = getFromCache('test-key')

      expect(result).toBeNull()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
    })

    it('devuelve los datos si están en caché y no han expirado', () => {
      const cachedData = {
        data: { id: '1', name: 'Test Data' },
        expiry: Date.now() + 3600000,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData))

      const result = getFromCache('test-key')

      expect(result).toEqual(cachedData.data)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
    })

    it('devuelve null y elimina los datos expirados', () => {
      const cachedData = {
        data: { id: '1', name: 'Test Data' },
        expiry: Date.now() - 1000,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData))

      const result = getFromCache('test-key')

      expect(result).toBeNull()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('maneja errores en el parseo de JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = getFromCache('test-key')

      expect(result).toBeNull()
    })

    it('maneja errores en localStorage', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = getFromCache('test-key')

      expect(result).toBeNull()
    })
  })

  describe('saveToCache', () => {
    it('guarda los datos en caché con tiempo de expiración', () => {
      const data = { id: '1', name: 'Test Data' }

      saveToCache('test-key', data)

      expect(localStorageMock.setItem).toHaveBeenCalled()

      const savedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedValue.data).toEqual(data)
      expect(savedValue.expiry).toBeGreaterThan(Date.now())
    })

    it('maneja errores al guardar en caché', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => saveToCache('test-key', { id: 1 })).not.toThrow()
    })
  })

  describe('getCacheKey', () => {
    it('genera clave para recurso sin ID', () => {
      const key = getCacheKey('products')
      expect(key).toBe('products')
    })

    it('genera clave para recurso con ID', () => {
      const key = getCacheKey('product', '123')
      expect(key).toBe('product_123')
    })
  })

  describe('clearCache', () => {
    it('elimina todas las claves de caché de productos', () => {
      const mockStore = {
        products: 'cached data',
        product_1: 'product data',
        product_2: 'product data',
        other_data: 'should not be removed',
      }

      for (const key in mockStore) {
        localStorageMock.key.mockImplementationOnce(() => key)
        localStorageMock.getItem.mockImplementationOnce(() => mockStore[key])
      }

      Object.defineProperty(localStorageMock, 'length', {
        value: Object.keys(mockStore).length,
        writable: true,
      })

      clearCache()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('products')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('product_1')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('product_2')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_data')
    })

    it('maneja errores al limpiar la caché', () => {
      localStorageMock.key.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => clearCache()).not.toThrow()
    })
  })
})
