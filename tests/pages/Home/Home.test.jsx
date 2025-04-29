import { h } from 'preact';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { Home } from '../../../src/pages/Home/index';
import { fetchProducts } from '../../../src/services/productService';

// Mock de los servicios
vi.mock('../../../src/services/productService', () => ({
  fetchProducts: vi.fn()
}));

// Mock de los componentes
vi.mock('../../../src/components/ProductCard/index.jsx', () => ({
  ProductCard: ({ product }) => (
    <div data-testid="product-card" data-product-id={product.id}>
      {product.brand} {product.model}
    </div>
  )
}));

// Mock para useLocation
const mockRoute = vi.fn();
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockRoute
  })
}));

// Mock para rxjs
vi.mock('rxjs', () => {
  const actual = vi.importActual('rxjs');
  return {
    ...actual,
    fromEvent: (element, eventName) => ({
      pipe: () => ({
        subscribe: (callback) => {
          // Simular la suscripción guardando el callback
          element._rxjsCallback = callback;
          return { unsubscribe: vi.fn() };
        }
      })
    })
  };
});

// Datos de ejemplo para los tests
const mockProducts = [
  { id: '1', brand: 'Apple', model: 'iPhone 13', price: 999, imgUrl: 'iphone13.jpg' },
  { id: '2', brand: 'Samsung', model: 'Galaxy S21', price: 899, imgUrl: 'galaxys21.jpg' },
  { id: '3', brand: 'Xiaomi', model: 'Mi 11', price: 799, imgUrl: 'mi11.jpg' },
  { id: '4', brand: 'Google', model: 'Pixel 6', price: 699, imgUrl: 'pixel6.jpg' },
  { id: '5', brand: 'OnePlus', model: '9 Pro', price: 899, imgUrl: 'oneplus9.jpg' },
  { id: '6', brand: 'Sony', model: 'Xperia 1 III', price: 1099, imgUrl: 'xperia1.jpg' },
];

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch exitoso por defecto
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    // Mock para document.addEventListener
    vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
  });

  it('muestra un mensaje de carga inicialmente', () => {
    render(<Home />);
    expect(screen.getByText('Cargando productos...')).toBeDefined();
  });

  it('carga y muestra una lista de productos', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando productos...')).toBeNull();
    });
    
    // Verificar que se llamó al servicio
    expect(fetchProducts).toHaveBeenCalled();
    
    // Verificar que se renderizan las tarjetas de producto
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards.length).toBe(6);
    
    // Verificar que los productos se muestran correctamente
    expect(screen.getByText('Apple iPhone 13')).toBeDefined();
    expect(screen.getByText('Samsung Galaxy S21')).toBeDefined();
  });

  it('muestra un mensaje de error si no se pueden cargar los productos', async () => {
    // Mock fetch con error
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Error de API'));
    
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando productos...')).toBeNull();
    });
    
    expect(screen.getByText('Error al cargar los productos')).toBeDefined();
  });

  it('navega a la página de detalle del producto al hacer clic en una sugerencia', async () => {
    const { container } = render(<Home />);
    
    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.queryByText('Cargando productos...')).toBeNull();
    });
    
    // Acceder al input directamente
    const searchInput = screen.getByPlaceholderText('Buscar por marca o modelo...');
    
    // Simular búsqueda disparando manualmente el callback de rxjs
    searchInput._rxjsCallback && searchInput._rxjsCallback('i');
    
    // Forzar renderizado para mostrar las sugerencias
    await waitFor(() => {
      const suggestions = screen.getAllByTestId('product-card');
      expect(suggestions.length).toBeGreaterThan(0);
    });
    
    // Simular clic en ProductCard
    const productCards = screen.getAllByTestId('product-card');
    fireEvent.click(productCards[0]);
    
    // Verificar que se navegó
    expect(mockRoute).toHaveBeenCalled();
  });

  it('muestra mensaje cuando no hay resultados de búsqueda', async () => {
    render(<Home />);
    
    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.queryByText('Cargando productos...')).toBeNull();
    });
    
    // Simular búsqueda sin resultados
    const searchInput = screen.getByPlaceholderText('Buscar por marca o modelo...');
    
    // Simular búsqueda disparando manualmente el callback de rxjs
    searchInput._rxjsCallback && searchInput._rxjsCallback('producto inexistente');
    
    // Verificar resultados
    await waitFor(() => {
      // Comprobar que no hay tarjetas de producto
      const productCards = screen.queryAllByTestId('product-card');
      expect(productCards.length).toBe(0);
    });
  });
});