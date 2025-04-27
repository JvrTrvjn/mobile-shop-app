import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFromCache, saveToCache, getCacheKey, clearCache } from '../../src/services/cache';

describe('Cache Service', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn(key => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index) => {
        return Object.keys(store)[index] || null;
      }),
      length: 0,
      get length() {
        return Object.keys(store).length;
      }
    };
  })();

  // Replace global localStorage with mock
  global.localStorage = localStorageMock;

  beforeEach(() => {
    // Clear all mocks before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    // Mock Date.now to control time
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  it('should save data to cache with expiration', () => {
    const testData = { name: 'Test' };
    saveToCache('testKey', testData);

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const callArgs = localStorageMock.setItem.mock.calls[0];
    expect(callArgs[0]).toBe('testKey');
    const savedData = JSON.parse(callArgs[1]);
    expect(savedData.data).toEqual(testData);
    // Should expire in 1 hour (3600000 ms)
    expect(savedData.expiry).toBe(Date.now() + 60 * 60 * 1000);
  });

  it('should retrieve valid data from cache', () => {
    // Setup valid cached data
    const testData = { test: 'value' };
    const cachedItem = {
      data: testData,
      expiry: Date.now() + 10000 // Not expired yet
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedItem));

    const result = getFromCache('testKey');

    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toEqual(testData);
  });

  it('should return null for expired data and remove it', () => {
    // Setup expired cached data
    const cachedItem = {
      data: { test: 'expired' },
      expiry: Date.now() - 1000 // Already expired
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedItem));

    const result = getFromCache('testKey');

    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
    expect(result).toBeNull();
  });

  it('should generate proper cache keys', () => {
    expect(getCacheKey('products')).toBe('products');
    expect(getCacheKey('product', '123')).toBe('product_123');
  });

  it('should clear only app-related cache items', () => {
    // Setup multiple cache entries
    const mockLocalStorage = {
      'products': 'data',
      'product_123': 'data',
      'other_app_key': 'data'
    };
    
    localStorageMock.length = Object.keys(mockLocalStorage).length;
    let index = 0;
    for (const key in mockLocalStorage) {
      localStorageMock.key.mockReturnValueOnce(key);
      localStorageMock.getItem.mockReturnValueOnce(mockLocalStorage[key]);
      index++;
    }

    clearCache();

    // Should remove product-related keys only
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('products');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('product_123');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_app_key');
  });
});