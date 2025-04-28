// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';

// Definimos mockNavigate como una variable global para el archivo
const mockNavigate = vi.fn();

// Mock de useLocation - debe ser declarado ANTES de importar el componente
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockNavigate
  })
}));

// Importamos el componente DESPUÉS de configurar los mocks
import { ProductCard } from '../../../src/components/ProductCard/index.jsx';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Test Brand',
    model: 'Test Model',
    price: 999,
    imgUrl: 'https://example.com/image.jpg'
  };

  // Limpiar el estado del mock antes de cada test
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // Limpiar el DOM después de cada test
  afterEach(() => {
    cleanup();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Brand')).toBeDefined();
    expect(screen.getByText('Test Model')).toBeDefined();
    expect(screen.getByText('999€')).toBeDefined();
  });

  it('navigates to product detail when clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Usar getAllByText y seleccionar el primer elemento si hay más de uno
    const buttons = screen.getAllByText('Ver detalles');
    fireEvent.click(buttons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });
});