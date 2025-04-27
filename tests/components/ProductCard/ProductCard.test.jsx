// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, describe, it, vi } from 'vitest';
import { ProductCard } from '../../../src/components/ProductCard/index.jsx';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Test Brand',
    model: 'Test Model',
    price: 999,
    imgUrl: 'https://example.com/image.jpg'
  };

  const mockNavigate = vi.fn();

  // Mock de useLocation
  vi.mock('preact-iso', () => ({
    useLocation: () => ({
      route: mockNavigate
    })
  }));

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Brand')).toBeDefined();
    expect(screen.getByText('Test Model')).toBeDefined();
    expect(screen.getByText('999€')).toBeDefined();
  });

  it('navigates to product detail when clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    const card = screen.getByText('Ver detalles');
    fireEvent.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });
});