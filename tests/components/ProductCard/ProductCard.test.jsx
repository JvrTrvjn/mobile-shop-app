import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockNavigate
  })
}));

import { ProductCard } from '../../../src/components/ProductCard/index.jsx';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Test Brand',
    model: 'Test Model',
    price: 999,
    imgUrl: 'https://example.com/image.jpg'
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

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
    
    const buttons = screen.getAllByText('Ver detalles');
    fireEvent.click(buttons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });
});