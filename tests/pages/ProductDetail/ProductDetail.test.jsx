import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { ProductDetail } from '../../../src/pages/ProductDetail/index'
import { fetchProductDetails } from '../../../src/services/productService'

vi.mock('../../../src/services/productService', () => ({
  fetchProductDetails: vi.fn(),
}))

const mockRoute = vi.fn()
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    url: '/product/1',
    route: mockRoute,
  }),
}))

vi.mock('../../../src/components/ColorSelector/index.jsx', () => ({
  ColorSelector: ({ colors, selectedColor, onColorSelect }) => (
    <div data-testid="color-selector">
      {colors.map(color => (
        <button
          key={color.code}
          data-testid={`color-option-${color.code}`}
          className={selectedColor === String(color.code) ? 'selected' : ''}
          onClick={() => onColorSelect(String(color.code))}
        >
          {color.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../../../src/components/StorageSelector/index.jsx', () => ({
  StorageSelector: ({ options, selectedStorage, onStorageSelect }) => (
    <div data-testid="storage-selector">
      {options.map(option => (
        <button
          key={option.code}
          data-testid={`storage-option-${option.code}`}
          className={selectedStorage === String(option.code) ? 'selected' : ''}
          onClick={() => onStorageSelect(String(option.code))}
        >
          {option.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../../../src/components/AddToCartButton/index.jsx', () => ({
  AddToCartButton: ({ product, selectedColor, selectedStorage }) => (
    <div data-testid="add-to-cart-button">
      Añadir al carrito ({selectedColor}, {selectedStorage})
    </div>
  ),
}))

describe('ProductDetail Page', () => {
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
    cpu: 'A15 Bionic',
    ram: '4 GB',
    os: 'iOS 15',
    displaySize: '6.1 pulgadas',
    battery: '3240 mAh',
    primaryCamera: ['12 MP', 'f/1.6'],
    dimensions: '146.7 x 71.5 x 7.65 mm',
    weight: '174',
    options: {
      colors: [
        { code: 1000, name: 'Negro' },
        { code: 2000, name: 'Blanco' },
        { code: 3000, name: 'Azul' },
      ],
      storages: [
        { code: 64, name: '64 GB' },
        { code: 128, name: '128 GB' },
        { code: 256, name: '256 GB' },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(fetchProductDetails).mockResolvedValue(mockProduct)
  })

  it('muestra un estado de carga inicialmente', () => {
    render(<ProductDetail id="1" />)
    expect(screen.getByText('Cargando detalles del producto...')).toBeDefined()
  })

  it('carga y muestra los detalles del producto', async () => {
    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(fetchProductDetails).toHaveBeenCalledWith('1')

    expect(screen.getByText('Apple iPhone 13')).toBeDefined()
    expect(screen.getByText('999€')).toBeDefined()

    expect(screen.getByText('CPU:')).toBeDefined()
    expect(screen.getByText('A15 Bionic')).toBeDefined()
    expect(screen.getByText('RAM:')).toBeDefined()
    expect(screen.getByText('4 GB')).toBeDefined()
    expect(screen.getByText('Sistema Operativo:')).toBeDefined()
    expect(screen.getByText('iOS 15')).toBeDefined()

    const productImage = screen.getByAltText('Apple iPhone 13')
    expect(productImage).toBeDefined()
    expect(productImage.getAttribute('src')).toBe('iphone13.jpg')

    expect(screen.getByTestId('color-selector')).toBeDefined()
    expect(screen.getByTestId('storage-selector')).toBeDefined()

    expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
  })

  it('muestra un mensaje de error si no se pueden cargar los detalles', async () => {
    vi.mocked(fetchProductDetails).mockRejectedValue(new Error('Error de API'))

    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    // Verificar mensaje de error
    expect(screen.getByText(/Error al cargar los detalles del producto/)).toBeDefined()

    // Verificar botón para volver
    const backButton = screen.getByText('Volver a la tienda')
    expect(backButton).toBeDefined()
  })

  it('extrae el ID de la URL si no se proporciona como prop', async () => {
    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(fetchProductDetails).toHaveBeenCalledWith('1')
  })

  it('navega a la página principal al hacer clic en el botón "Volver a la tienda"', async () => {
    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    fireEvent.click(screen.getByText('← Volver a la tienda'))

    expect(mockRoute).toHaveBeenCalledWith('/')
  })

  it('muestra "Imagen no disponible" cuando no hay URL de imagen', async () => {
    const productWithoutImage = {
      ...mockProduct,
      imgUrl: null,
    }
    vi.mocked(fetchProductDetails).mockResolvedValue(productWithoutImage)

    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getByText('Imagen no disponible')).toBeDefined()
  })

  it('muestra "Precio no disponible" cuando no hay precio', async () => {
    const productWithoutPrice = {
      ...mockProduct,
      price: null,
    }
    vi.mocked(fetchProductDetails).mockResolvedValue(productWithoutPrice)

    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getByText('Precio no disponible')).toBeDefined()
  })

  it('permite seleccionar diferentes opciones de color', async () => {
    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getByTestId('add-to-cart-button').textContent).toContain('1000')

    fireEvent.click(screen.getByTestId('color-option-2000'))

    expect(screen.getByTestId('add-to-cart-button').textContent).toContain('2000')
  })

  it('permite seleccionar diferentes opciones de almacenamiento', async () => {
    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getByTestId('add-to-cart-button').textContent).toContain('64')

    fireEvent.click(screen.getByTestId('storage-option-128'))

    expect(screen.getByTestId('add-to-cart-button').textContent).toContain('128')
  })

  it('muestra mensaje cuando no hay opciones disponibles', async () => {
    const productWithoutOptions = {
      ...mockProduct,
      options: {
        colors: [],
        storages: [],
      },
    }
    vi.mocked(fetchProductDetails).mockResolvedValue(productWithoutOptions)

    render(<ProductDetail id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getByText('No hay opciones de color disponibles')).toBeDefined()
    expect(screen.getByText('No hay opciones de almacenamiento disponibles')).toBeDefined()
  })
})
