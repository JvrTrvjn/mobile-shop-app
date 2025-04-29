import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { ColorSelector } from '../../../src/components/ColorSelector/index.jsx';

describe('ColorSelector Component', () => {
  const mockColors = [
    { code: 1000, name: 'Black' },
    { code: 1001, name: 'White' },
    { code: 1002, name: 'Red' }
  ];
  
  const mockOnColorSelect = vi.fn();

  beforeEach(() => {
    mockOnColorSelect.mockClear();
  });

  it('renders color options correctly', () => {
    render(<ColorSelector 
      colors={mockColors} 
      onColorSelect={mockOnColorSelect} 
      selectedColor="1000"
    />);
    
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    
    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions.length).toBe(3);
    
    const selectedOption = screen.getByText('Black').closest('.color-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('calls onColorSelect when a color is clicked', () => {
    render(<ColorSelector 
      colors={mockColors} 
      onColorSelect={mockOnColorSelect} 
      selectedColor="1000"
    />);
    
    const whiteOption = screen.getByText('White').closest('.color-option');
    fireEvent.click(whiteOption);
    
    expect(mockOnColorSelect).toHaveBeenCalledWith('1001');
  });

  it('renders nothing when colors array is empty', () => {
    const { container } = render(<ColorSelector 
      colors={[]} 
      onColorSelect={mockOnColorSelect}
      selectedColor=""
    />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles color mapping correctly', () => {
    const customColors = [
      { code: 2000, name: 'Midnight Blue' },
      { code: 2001, name: 'Rose Gold' }
    ];
    
    render(<ColorSelector 
      colors={customColors} 
      onColorSelect={mockOnColorSelect} 
      selectedColor="2000"
    />);
    
    const midnightOption = screen.getByText('Midnight Blue').closest('.color-option');
    const roseOption = screen.getByText('Rose Gold').closest('.color-option');
    
    expect(midnightOption).toHaveClass('selected');
    expect(roseOption).not.toHaveClass('selected');
    
    const midnightSwatch = midnightOption.querySelector('.color-swatch');
    const roseSwatch = roseOption.querySelector('.color-swatch');
    expect(midnightSwatch).toBeInTheDocument();
    expect(roseSwatch).toBeInTheDocument();
  });
});