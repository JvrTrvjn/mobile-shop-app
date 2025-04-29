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
    
    // Verificar que todos los colores se renderizan
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    
    // Verificar que hay 3 opciones de color
    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions.length).toBe(3);
    
    // Verificar que el color correcto está seleccionado
    const selectedOption = screen.getByText('Black').closest('.color-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('calls onColorSelect when a color is clicked', () => {
    render(<ColorSelector 
      colors={mockColors} 
      onColorSelect={mockOnColorSelect} 
      selectedColor="1000"
    />);
    
    // Hacer clic en la opción White
    const whiteOption = screen.getByText('White').closest('.color-option');
    fireEvent.click(whiteOption);
    
    // Verificar que onColorSelect se llama con el código correcto
    expect(mockOnColorSelect).toHaveBeenCalledWith('1001');
  });

  it('renders nothing when colors array is empty', () => {
    const { container } = render(<ColorSelector 
      colors={[]} 
      onColorSelect={mockOnColorSelect} 
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
    
    // Verificar que los colores especiales se mapean correctamente
    const midnightOption = screen.getByText('Midnight Blue').closest('.color-option');
    const roseOption = screen.getByText('Rose Gold').closest('.color-option');
    
    // Comprobar que el primero está seleccionado
    expect(midnightOption).toHaveClass('selected');
    expect(roseOption).not.toHaveClass('selected');
    
    // Comprobar que los swatches tienen las clases correctas
    const midnightSwatch = midnightOption.querySelector('.color-swatch');
    const roseSwatch = roseOption.querySelector('.color-swatch');
    expect(midnightSwatch).toBeInTheDocument();
    expect(roseSwatch).toBeInTheDocument();
  });
});