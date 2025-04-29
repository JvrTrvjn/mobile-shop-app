import { render, act, waitFor } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { CartProvider, useCart } from '../../src/context/CartContext';

// Mock de los servicios
vi.mock('../../src/services/productService', () => ({
  getCartCount: vi.fn(() => mockCartCount),
  updateCartCount: vi.fn(),
  addProductToCart: vi.fn(() => Promise.resolve({ count: mockApiResponse }))
}));

// Mock del logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn()
  }
}));

// Variables globales para controlar los mocks
let mockCartCount = 0;
let mockApiResponse = 5;

// Componente de test para acceder al contexto
function TestComponent({ testFn }) {
  const cartContext = useCart();
  testFn(cartContext);
  return null;
}

describe('CartContext', () => {
  // Spy para CustomEvent
  let dispatchEventSpy;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockCartCount = 0;
    mockApiResponse = 5;
    
    // Espiar dispatchEvent para CustomEvent
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'cartCount') return String(mockCartCount);
      return null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicializa el estado correctamente', async () => {
    mockCartCount = 3;
    
    // Capturar el contexto real para verificar después
    let capturedContext;
    
    const testFn = vi.fn((cartContext) => {
      capturedContext = cartContext;
    });
    
    render(
      <CartProvider>
        <TestComponent testFn={testFn} />
      </CartProvider>
    );
    
    // Verificar después que el valor se inicializó correctamente
    expect(capturedContext.state.count).toBe(3);
    expect(capturedContext.state.items).toEqual([]);
    expect(capturedContext.state.total).toBe(0);
  });

  it('añade un producto al carrito y sincroniza con el servidor', async () => {
    mockCartCount = 0;
    mockApiResponse = 1; // El servidor devuelve que hay 1 producto
    
    const mockProduct = {
      id: '1',
      brand: 'Test Brand',
      model: 'Test Model',
      price: 999
    };
    
    let cartContextCapture;
    
    const testFn = vi.fn((cartContext) => {
      cartContextCapture = cartContext;
    });
    
    render(
      <CartProvider>
        <TestComponent testFn={testFn} />
      </CartProvider>
    );
    
    // Añadir al carrito
    await act(async () => {
      await cartContextCapture.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Verificar que el item se añadió correctamente
    expect(cartContextCapture.state.items.length).toBe(1);
    expect(cartContextCapture.state.items[0].id).toBe('1');
    expect(cartContextCapture.state.items[0].selectedColor).toBe('1000');
    expect(cartContextCapture.state.items[0].selectedStorage).toBe('64');
    expect(cartContextCapture.state.items[0].quantity).toBe(1);
    
    // Verificar que se emitió el evento cartUpdated
    expect(dispatchEventSpy).toHaveBeenCalled();
    const event = dispatchEventSpy.mock.calls[0][0];
    expect(event.type).toBe('cartUpdated');
  });

  it('sincroniza el contador del carrito con el servidor', async () => {
    mockCartCount = 2;
    mockApiResponse = 8; // El servidor devuelve 8 items
    
    const mockProduct = {
      id: '1',
      brand: 'Test Brand',
      model: 'Test Model',
      price: 999
    };
    
    let cartContextCapture;
    
    const testFn = vi.fn((cartContext) => {
      cartContextCapture = cartContext;
    });
    
    render(
      <CartProvider>
        <TestComponent testFn={testFn} />
      </CartProvider>
    );
    
    // Añadir producto
    await act(async () => {
      await cartContextCapture.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Verificar que el contador se sincronizó con el valor más alto (del servidor)
    expect(cartContextCapture.state.count).toBe(8);
  });

  it('maneja errores al añadir al carrito', async () => {
    // Mock para simular un error
    const { addProductToCart } = await import('../../src/services/productService');
    const addProductToCartMock = vi.fn().mockRejectedValue(new Error('Error de prueba'));
    vi.mocked(addProductToCart).mockImplementation(addProductToCartMock);
    
    const mockProduct = {
      id: '1',
      brand: 'Test Brand',
      model: 'Test Model',
      price: 999
    };
    
    let cartContextCapture;
    
    const testFn = vi.fn((cartContext) => {
      cartContextCapture = cartContext;
    });
    
    render(
      <CartProvider>
        <TestComponent testFn={testFn} />
      </CartProvider>
    );
    
    // Intentar añadir el producto (debería fallar)
    await expect(async () => {
      await cartContextCapture.addToCart(mockProduct, 1, '1000', '64');
    }).rejects.toThrow('No se pudo añadir el producto al carrito');
  });
});