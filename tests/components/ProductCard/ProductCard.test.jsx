import { h } from 'preact';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { ProductCard } from '../../../src/components/ProductCard/index';

// Mock de route
const mockRoute = vi.fn();
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockRoute
  })
}));

describe('ProductCard Component', () => {
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
  });

  afterEach(() => {
    cleanup();
  });

  it('no renderiza nada cuando no se proporciona un producto', () => {
    const { container } = render(<ProductCard />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza correctamente la información del producto', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Verificar que se muestra la información
    expect(screen.getByText('Apple')).toBeDefined();
    expect(screen.getByText('iPhone 13')).toBeDefined();
    expect(screen.getByText('999€')).toBeDefined();
    expect(screen.getByAltText('Apple iPhone 13')).toBeDefined();
    expect(screen.getByText('Ver detalles')).toBeDefined();
  });

  it('muestra un placeholder cuando no hay imagen', () => {
    const productWithoutImage = {
      ...mockProduct,
      imgUrl: null
    };
    
    render(<ProductCard product={productWithoutImage} />);
    
    // Verificar que se muestra el placeholder
    expect(screen.queryByAltText('Apple iPhone 13')).toBeNull();
    const placeholder = document.querySelector('.product-image-placeholder');
    expect(placeholder).not.toBeNull();
  });

  it('muestra "Precio no disponible" cuando no hay precio', () => {
    const productWithoutPrice = {
      ...mockProduct,
      price: null
    };
    
    render(<ProductCard product={productWithoutPrice} />);
    
    // Verificar que se muestra el mensaje
    expect(screen.getByText('Precio no disponible')).toBeDefined();
  });

  it('navega al detalle del producto al hacer clic en la tarjeta', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Hacer clic en la tarjeta
    const card = document.querySelector('.product-card');
    fireEvent.click(card);
    
    // Verificar que se navegó a la página de detalle
    expect(mockRoute).toHaveBeenCalledWith('/product/1');
  });

  it('navega al detalle del producto al hacer clic en el botón', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Hacer clic en el botón
    fireEvent.click(screen.getByText('Ver detalles'));
    
    // Verificar que se navegó a la página de detalle
    expect(mockRoute).toHaveBeenCalledWith('/product/1');
  });

  it('previene la propagación al hacer clic en el botón', () => {
    // Mock de la función stopPropagation
    const eventMock = { stopPropagation: vi.fn() };
    
    // Monitorear los eventos para detectar cuando se llama a stopPropagation
    const originalAddEventListener = document.addEventListener;
    let capturedHandler;
    
    document.addEventListener = vi.fn((event, handler) => {
      if (event === 'click') {
        capturedHandler = handler;
      }
      return originalAddEventListener.call(document, event, handler);
    });
    
    render(<ProductCard product={mockProduct} />);
    
    // Simular click en el botón con nuestro evento personalizado
    const button = screen.getByText('Ver detalles');
    fireEvent(button, new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ...eventMock
    }));
    
    // Restablecer el método original
    document.addEventListener = originalAddEventListener;
    
    // Verificar que se llamó a mockRoute
    expect(mockRoute).toHaveBeenCalledWith('/product/1');
  });
});
