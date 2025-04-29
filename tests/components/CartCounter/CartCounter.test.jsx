import { render, screen, act } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { CartCounter } from '../../../src/components/CartCounter/index.jsx';

// Mock del contexto del carrito
vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => ({
    state: { count: mockCartCount }
  })
}));

// Mock del servicio de productos
vi.mock('../../../src/services/productService', () => ({
  getCartCount: () => mockStoredCartCount
}));

// Mock del logger
vi.mock('../../../src/utils/logger', () => ({
  default: {
    log: vi.fn()
  }
}));

// Variables para controlar los valores mockeados
let mockCartCount = 0;
let mockStoredCartCount = 0;

describe('CartCounter Component', () => {
  beforeEach(() => {
    mockCartCount = 0;
    mockStoredCartCount = 0;
    vi.clearAllMocks();
  });

  it('renders without count badge when cart is empty', () => {
    const { container } = render(<CartCounter />);
    
    // El icono del carrito debe estar visible
    expect(container.querySelector('.cart-icon')).toBeTruthy();
    
    // El contador no debe mostrarse cuando es 0
    const countBadge = container.querySelector('.cart-count');
    expect(countBadge).toBeFalsy();
  });

  it('displays the correct count from cart context', () => {
    mockCartCount = 5;
    
    const { container } = render(<CartCounter />);
    
    // El contador debe mostrar el valor correcto
    const countBadge = container.querySelector('.cart-count');
    expect(countBadge).toBeTruthy();
    expect(countBadge.textContent).toBe('5');
  });

  it('updates when cart context changes', () => {
    // Configurar el mock para iniciar con 0
    mockCartCount = 0;
    
    const { container, rerender } = render(<CartCounter />);
    
    // No debería haber contador visible
    expect(container.querySelector('.cart-count')).toBeFalsy();
    
    // Cambiar el valor del contexto y volver a renderizar
    mockCartCount = 3;
    rerender(<CartCounter />);
    
    // El contador debe actualizarse
    const countBadge = container.querySelector('.cart-count');
    expect(countBadge).toBeTruthy();
    expect(countBadge.textContent).toBe('3');
  });

  it('updates when cartUpdated event is fired', () => {
    // Configurar el mock del localStorage
    mockCartCount = 2;
    mockStoredCartCount = 2;
    
    const { container } = render(<CartCounter />);
    
    // Verificar valor inicial
    expect(container.querySelector('.cart-count').textContent).toBe('2');
    
    // Simular un cambio en localStorage y disparar el evento
    mockStoredCartCount = 7;
    
    act(() => {
      // Disparar el evento personalizado
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    });
    
    // El contador debe actualizarse según localStorage
    expect(container.querySelector('.cart-count').textContent).toBe('7');
  });

  it('adds and removes event listener correctly', () => {
    // Espiar el addEventListener y removeEventListener
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<CartCounter />);
    
    // Verificar que se agregó el event listener
    expect(addEventSpy).toHaveBeenCalledWith('cartUpdated', expect.any(Function));
    
    // Desmontar el componente
    unmount();
    
    // Verificar que se removió el event listener
    expect(removeEventSpy).toHaveBeenCalledWith('cartUpdated', expect.any(Function));
  });
});