import { h } from 'preact';
import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, describe, it, vi } from 'vitest';
import { Breadcrumb } from '../../../src/components/Breadcrumb/index';

// Mock de route
const mockRoute = vi.fn();
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockRoute
  })
}));

describe('Breadcrumb Component', () => {
  it('no renderiza nada cuando no se proporcionan items', () => {
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada cuando se proporciona un array vacío', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza correctamente un solo item', () => {
    const items = [{ label: 'Home' }];
    render(<Breadcrumb items={items} />);
    
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.queryByText('/')).toBeNull(); // No debe haber separadores con un solo item
  });

  it('renderiza múltiples items con separadores', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: 'Product Details' }
    ];
    render(<Breadcrumb items={items} />);
    
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Product Details')).toBeDefined();
    
    // Debe haber 2 separadores (entre los 3 items)
    const separators = screen.queryAllByText('/');
    expect(separators.length).toBe(2);
  });

  it('navega al hacer clic en un item con path', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: 'Product Details' }
    ];
    render(<Breadcrumb items={items} />);
    
    // Hacer clic en el elemento Home
    fireEvent.click(screen.getByText('Home'));
    expect(mockRoute).toHaveBeenCalledWith('/');
    
    // Hacer clic en el elemento Products
    fireEvent.click(screen.getByText('Products'));
    expect(mockRoute).toHaveBeenCalledWith('/products');
  });

  it('no navega al hacer clic en el último item aunque tenga path', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Product Details', path: '/product/1' }
    ];
    render(<Breadcrumb items={items} />);
    
    // El último item no debe ser clickeable
    const lastItem = screen.getByText('Product Details');
    expect(lastItem.closest('.breadcrumb-link')).toBeNull();
    
    // Pero el primer item sí
    fireEvent.click(screen.getByText('Home'));
    expect(mockRoute).toHaveBeenCalledWith('/');
  });

  it('aplica las clases CSS correctas a los elementos', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: 'Product Details' }
    ];
    render(<Breadcrumb items={items} />);
    
    // Verificar clases de links vs texto
    expect(screen.getByText('Home').className).toBe('breadcrumb-link');
    expect(screen.getByText('Products').className).toBe('breadcrumb-link');
    expect(screen.getByText('Product Details').className).toBe('breadcrumb-text');
  });
});