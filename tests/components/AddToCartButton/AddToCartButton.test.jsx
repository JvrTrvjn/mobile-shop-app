import { h } from 'preact';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { AddToCartButton } from '../../../src/components/AddToCartButton/index';

// Mock de los contextos
const mockAddToCart = vi.fn();
vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart
  })
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
};
vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => mockToast
}));

describe('AddToCartButton Component', () => {
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
    // Simular operaciones asíncronas exitosas por defecto
    mockAddToCart.mockResolvedValue({ count: 1 });
  });

  it('renderiza el botón correctamente', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Verificar que se muestra el botón y los controles de cantidad
    expect(screen.getByText('Añadir al carrito')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined(); // Cantidad por defecto
    expect(screen.getByText('-')).toBeDefined();
    expect(screen.getByText('+')).toBeDefined();
  });

  it('incrementa la cantidad al hacer clic en el botón +', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Clic en el botón +
    fireEvent.click(screen.getByText('+'));
    
    // Verificar que la cantidad aumentó
    expect(screen.getByText('2')).toBeDefined();
  });

  it('decrementa la cantidad al hacer clic en el botón -', async () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Primero incrementar para poder decrementar
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('2')).toBeDefined();
    
    // Clic en el botón -
    fireEvent.click(screen.getByText('-'));
    
    // Verificar que la cantidad disminuyó
    expect(screen.getByText('1')).toBeDefined();
  });

  it('no decrementa por debajo de 1', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Intentar decrementar cuando la cantidad es 1
    fireEvent.click(screen.getByText('-'));
    
    // Verificar que la cantidad sigue siendo 1
    expect(screen.getByText('1')).toBeDefined();
  });

  it('muestra un mensaje cuando no se ha seleccionado color', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor={null}
        selectedStorage="64"
      />
    );
    
    // Verificar que se muestra el mensaje
    expect(screen.getByText('Selecciona un color')).toBeDefined();
    
    // Verificar que el botón está deshabilitado
    const button = screen.getByText('Añadir al carrito');
    expect(button.disabled).toBe(true);
  });

  it('muestra un mensaje cuando no se ha seleccionado almacenamiento', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage={null}
      />
    );
    
    // Verificar que se muestra el mensaje
    expect(screen.getByText('Selecciona almacenamiento')).toBeDefined();
    
    // Verificar que el botón está deshabilitado
    const button = screen.getByText('Añadir al carrito');
    expect(button.disabled).toBe(true);
  });

  it('muestra un mensaje cuando no se ha seleccionado ni color ni almacenamiento', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor={null}
        selectedStorage={null}
      />
    );
    
    // Verificar que se muestra el mensaje
    expect(screen.getByText('Selecciona color y almacenamiento')).toBeDefined();
    
    // Verificar que el botón está deshabilitado
    const button = screen.getByText('Añadir al carrito');
    expect(button.disabled).toBe(true);
  });

  it('el botón está deshabilitado cuando no hay selecciones completas', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor={null}
        selectedStorage={null}
      />
    );
    
    // Verificar que el botón está deshabilitado
    const button = screen.getByText('Añadir al carrito');
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('disabled')).toBe(true);
  });

  it('llama a addToCart con los parámetros correctos', async () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Hacer clic en el botón de añadir al carrito
    const addButton = screen.getByText('Añadir al carrito');
    
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Verificar que se llamó a la función addToCart con los parámetros correctos
    expect(mockAddToCart).toHaveBeenCalledWith(
      mockProduct,
       1,  // Cantidad por defecto
      "1000", // Color seleccionado
      "64"  // Almacenamiento seleccionado
    );
  });

  it('maneja errores al añadir al carrito', async () => {
    // Simular un error al añadir al carrito
    const errorMessage = 'Error de prueba';
    mockAddToCart.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <AddToCartButton
        product={mockProduct}
        selectedColor="1000"
        selectedStorage="64"
      />
    );
    
    // Hacer clic en el botón de añadir al carrito
    const addButton = screen.getByText('Añadir al carrito');
    
    await act(async () => {
      fireEvent.click(addButton);
      // Esperar a que la promesa se resuelva (o rechace)
      await new Promise(process.nextTick);
    });
    
    // Verificar que se llamó a la función de error
    expect(mockToast.error).toHaveBeenCalled();
  });
});
