import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFromCache, saveToCache, getCacheKey, clearCache } from '../../src/services/cache';

describe('Cache Service', () => {
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

  global.localStorage = localStorageMock;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
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
    expect(savedData.expiry).toBe(Date.now() + 60 * 60 * 1000);
  });

  it('should retrieve valid data from cache', () => {
    const testData = { test: 'value' };
    const cachedItem = {
      data: testData,
      expiry: Date.now() + 10000 
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedItem));

    const result = getFromCache('testKey');

    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toEqual(testData);
  });

  it('should return null for expired data and remove it', () => {
    const cachedItem = {
      data: { test: 'expired' },
      expiry: Date.now() - 1000 
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
    
    const keys = Object.keys(mockLocalStorage);
    localStorageMock.key.mockImplementation((index) => keys[index] || null);
    Object.defineProperty(localStorageMock, 'length', {
      get: () => keys.length
    });
    
    keys.forEach(key => {
      localStorageMock.getItem.mockImplementationOnce(() => mockLocalStorage[key]);
    });

    clearCache();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('products');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('product_123');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_app_key');
  });
});