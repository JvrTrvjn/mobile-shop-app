import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { StorageSelector } from '../../../src/components/StorageSelector/index.jsx';

describe('StorageSelector Component', () => {
  // Opciones en formato objeto (como vienen de la API)
  const mockStorageOptions = [
    { code: 64, name: '64 GB' },
    { code: 128, name: '128 GB' },
    { code: 256, name: '256 GB' }
  ];
  
  // Opciones en formato primitivo (valores directos)
  const mockStoragePrimitives = [64, 128, 256];
  
  const mockOnStorageSelect = vi.fn();

  beforeEach(() => {
    mockOnStorageSelect.mockClear();
  });

  it('renders storage options correctly with object format', () => {
    render(<StorageSelector 
      options={mockStorageOptions} 
      onStorageSelect={mockOnStorageSelect} 
      selectedStorage="64"
    />);
    
    // Verificar que todas las opciones se renderizan
    expect(screen.getByText('64 GB')).toBeInTheDocument();
    expect(screen.getByText('128 GB')).toBeInTheDocument();
    expect(screen.getByText('256 GB')).toBeInTheDocument();
    
    // Verificar que hay 3 opciones de almacenamiento
    const storageOptions = document.querySelectorAll('.storage-option');
    expect(storageOptions.length).toBe(3);
    
    // Verificar que la opción correcta está seleccionada
    const selectedOption = screen.getByText('64 GB').closest('.storage-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('renders storage options correctly with primitive values', () => {
    render(<StorageSelector 
      options={mockStoragePrimitives} 
      onStorageSelect={mockOnStorageSelect} 
      selectedStorage="128"
    />);
    
    // Verificar que todas las opciones se renderizan con el formato correcto
    expect(screen.getByText('64 GB')).toBeInTheDocument();
    expect(screen.getByText('128 GB')).toBeInTheDocument();
    expect(screen.getByText('256 GB')).toBeInTheDocument();
    
    // Verificar que la opción correcta está seleccionada
    const selectedOption = screen.getByText('128 GB').closest('.storage-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('calls onStorageSelect when a storage option is clicked', () => {
    render(<StorageSelector 
      options={mockStorageOptions} 
      onStorageSelect={mockOnStorageSelect} 
      selectedStorage="64"
    />);
    
    // Hacer clic en la opción 128 GB
    const option128GB = screen.getByText('128 GB').closest('.storage-option');
    fireEvent.click(option128GB);
    
    // Verificar que onStorageSelect se llama con el código correcto
    expect(mockOnStorageSelect).toHaveBeenCalledWith('128');
  });

  it('renders nothing when options array is empty', () => {
    const { container } = render(<StorageSelector 
      options={[]} 
      onStorageSelect={mockOnStorageSelect} 
    />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles options without name property', () => {
    const optionsWithoutName = [
      { code: 64 },
      { code: 128 }
    ];
    
    render(<StorageSelector 
      options={optionsWithoutName} 
      onStorageSelect={mockOnStorageSelect} 
      selectedStorage="64"
    />);
    
    // Verificar que las opciones se renderizan con el formato de fallback
    expect(screen.getByText('64 GB')).toBeInTheDocument();
    expect(screen.getByText('128 GB')).toBeInTheDocument();
  });
});