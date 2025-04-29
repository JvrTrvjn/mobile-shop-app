import { h } from 'preact';
import { render, act, waitFor } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { CartProvider, useCart, CartContext } from '../../src/context/CartContext';
import { getCartCount, updateCartCount, addProductToCart } from '../../src/services/productService';

// Mock de los servicios
vi.mock('../../src/services/productService', () => ({
  getCartCount: vi.fn(),
  updateCartCount: vi.fn(),
  addProductToCart: vi.fn()
}));

// Mock del logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

// Componente de prueba para acceder al contexto
const TestComponent = ({ onRender }) => {
  const cartContext = useCart();
  onRender(cartContext);
  return <div>Test Component</div>;
};

describe('CartContext', () => {
  // Variables para pruebas
  let cartContext;
  const onRender = ctx => {
    cartContext = ctx;
  };

  // Datos de ejemplo para tests
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mocks predeterminados
    vi.mocked(getCartCount).mockReturnValue(0);
    vi.mocked(addProductToCart).mockResolvedValue({ count: 1 });
  });

  it('inicializa el carrito con contador en 0', () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    expect(cartContext.state.count).toBe(0);
    expect(cartContext.state.total).toBe(0);
    expect(cartContext.state.items).toEqual([]);
  });

  it('añade un producto al carrito', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Verificar que se actualizó el estado
    expect(cartContext.state.count).toBe(1);
    expect(cartContext.state.total).toBe(999); // Precio del producto
    expect(cartContext.state.items).toHaveLength(1);
    expect(cartContext.state.items[0].id).toBe('1');
    expect(cartContext.state.items[0].quantity).toBe(1);
    expect(cartContext.state.items[0].selectedColor).toBe('1000');
    expect(cartContext.state.items[0].selectedStorage).toBe('64');
    
    // Verificar que se llamó a la API
    expect(addProductToCart).toHaveBeenCalledWith({
      id: '1',
      colorCode: 1000,
      storageCode: 64
    });
  });

  it('actualiza la cantidad si el mismo producto se añade de nuevo', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir producto por primera vez
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Añadir el mismo producto otra vez
    await act(async () => {
      await cartContext.addToCart(mockProduct, 2, '1000', '64');
    });
    
    // Verificar que se actualizó la cantidad y no se duplicó el producto
    expect(cartContext.state.count).toBe(3);
    expect(cartContext.state.total).toBe(2997); // 999 * 3
    expect(cartContext.state.items).toHaveLength(1);
    expect(cartContext.state.items[0].quantity).toBe(3);
  });

  it('añade productos diferentes como elementos separados', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir producto con color negro
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Añadir el mismo producto pero con color blanco
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '2000', '64');
    });
    
    // Verificar que son elementos separados
    expect(cartContext.state.count).toBe(2);
    expect(cartContext.state.total).toBe(1998); // 999 * 2
    expect(cartContext.state.items).toHaveLength(2);
    expect(cartContext.state.items[0].selectedColor).toBe('1000');
    expect(cartContext.state.items[1].selectedColor).toBe('2000');
  });

  it('elimina un producto del carrito', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir un producto
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Eliminar el producto
    act(() => {
      cartContext.removeFromCart(0);
    });
    
    // Verificar que se eliminó correctamente
    expect(cartContext.state.count).toBe(0); // Esperamos 0 ya que eliminamos el único producto
    expect(cartContext.state.total).toBe(0);
    expect(cartContext.state.items).toHaveLength(0);
  });

  it('actualiza la cantidad de un producto', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir un producto
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Actualizar la cantidad
    act(() => {
      cartContext.updateQuantity(0, 3);
    });
    
    // Verificar que se actualizó la cantidad
    expect(cartContext.state.count).toBe(3);
    expect(cartContext.state.total).toBe(2997); // 999 * 3
    expect(cartContext.state.items).toHaveLength(1);
    expect(cartContext.state.items[0].quantity).toBe(3);
  });

  it('limpia el carrito completamente', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir algunos productos
    await act(async () => {
      await cartContext.addToCart(mockProduct, 2, '1000', '64');
      await cartContext.addToCart(mockProduct, 1, '2000', '128');
    });
    
    // Limpiar el carrito
    act(() => {
      cartContext.clearCart();
    });
    
    // Verificar que el carrito está vacío
    expect(cartContext.state.count).toBe(0);
    expect(cartContext.state.total).toBe(0);
    expect(cartContext.state.items).toHaveLength(0);
  });

  it('maneja los errores al añadir un producto', async () => {
    // Simular un error en la API
    vi.mocked(addProductToCart).mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Intentar añadir un producto que causará un error
    let error;
    await act(async () => {
      try {
        await cartContext.addToCart(mockProduct, 1, '1000', '64');
      } catch (err) {
        error = err;
      }
    });
    
    // Verificar que se capturó el error
    expect(error).toBeDefined();
    expect(error.message).toBe('No se pudo añadir el producto al carrito. Inténtalo de nuevo.');
  });

  it('rechaza añadir un producto con códigos inválidos', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Intentar añadir un producto con un código inválido
    let error;
    await act(async () => {
      try {
        await cartContext.addToCart(mockProduct, 1, 'invalid', '64');
      } catch (err) {
        error = err;
      }
    });
    
    // Verificar que se capturó el error
    expect(error).toBeDefined();
    expect(error.message).toBe('No se pudo añadir el producto al carrito. Inténtalo de nuevo.');
  });

  it('sincroniza el contador del carrito con el servidor', async () => {
    // Simular que el servidor tiene más productos
    vi.mocked(addProductToCart).mockResolvedValueOnce({ count: 5 });
    
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    );
    
    // Añadir un producto
    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64');
    });
    
    // Verificar que se tomó el valor mayor (el del servidor)
    expect(cartContext.state.count).toBe(5);
  });
});