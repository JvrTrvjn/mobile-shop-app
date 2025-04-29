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
      {options.map(storage => (
        <button
          key={storage.code}
          data-testid={`storage-option-${storage.code}`}
          className={selectedStorage === String(storage.code) ? 'selected' : ''}
          onClick={() => onStorageSelect(String(storage.code))}
        >
          {storage.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../../../src/components/AddToCartButton/index.jsx', () => ({
  AddToCartButton: ({ product, selectedColor, selectedStorage }) => (
    <div
      data-testid="add-to-cart-button"
      data-product-id={product.id}
      data-color={selectedColor}
      data-storage={selectedStorage}
    >
      AddToCartButton
    </div>
  ),
}))

vi.mock('../../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'product.loading': 'Cargando detalles del producto...',
        'product.error': 'Error al cargar el producto',
        'product.tryAgain': 'Intentar de nuevo',
        'product.colors': 'Colores:',
        'product.storage': 'Almacenamiento:',
        'product.price': 'Precio:',
        'product.brand': 'Marca:',
        'product.cpu': 'CPU:',
        'product.ram': 'RAM:',
        'product.os': 'Sistema operativo:',
        'product.displaySize': 'Tamaño de pantalla:',
        'product.camera': 'Cámara:',
        'product.dimensions': 'Dimensiones:',
        'product.weight': 'Peso:',
        'product.notFound': 'Producto no encontrado',
      }
      return translations[key] || key
    },
    language: 'es',
  }),
}))

vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}))

describe('ProductDetail Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
    cpu: 'A15',
    ram: '6GB',
    os: 'iOS 15',
    displaySize: '6.1 inches',
    camera: '12MP',
    dimensions: '146.7 x 71.5 x 7.7 mm',
    weight: '174g',
    options: {
      colors: [
        { code: 1000, name: 'Negro' },
        { code: 2000, name: 'Blanco' },
      ],
      storages: [
        { code: 1, name: '64GB' },
        { code: 2, name: '128GB' },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fetchProductDetails.mockResolvedValue(mockProduct)
  })

  it('muestra un mensaje de carga mientras se obtienen los datos', async () => {
    fetchProductDetails.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProduct), 100))
    )

    render(<ProductDetail />)

    expect(screen.getByText('Cargando detalles del producto...')).toBeDefined()

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })
  })

  it('muestra los detalles del producto correctamente', async () => {
    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeDefined()
      expect(screen.getByText('iPhone 13')).toBeDefined()
      expect(screen.getByText('999€')).toBeDefined()
      expect(screen.getByText('CPU:')).toBeDefined()
      expect(screen.getByText('A15')).toBeDefined()
      expect(screen.getByTestId('color-selector')).toBeDefined()
      expect(screen.getByTestId('storage-selector')).toBeDefined()
      expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
    })
  })

  it('permite seleccionar un color', async () => {
    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByTestId('color-selector')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('color-option-2000'))

    await waitFor(() => {
      const addToCartButton = screen.getByTestId('add-to-cart-button')
      expect(addToCartButton.dataset.color).toBe('2000')
    })
  })

  it('permite seleccionar un almacenamiento', async () => {
    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByTestId('storage-selector')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('storage-option-2'))

    await waitFor(() => {
      const addToCartButton = screen.getByTestId('add-to-cart-button')
      expect(addToCartButton.dataset.storage).toBe('2')
    })
  })

  it('muestra un mensaje de error cuando falla la carga', async () => {
    fetchProductDetails.mockRejectedValue(new Error('Error de prueba'))

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el producto')).toBeDefined()
      expect(screen.getByText('Intentar de nuevo')).toBeDefined()
    })
  })

  it('permite reintentar la carga después de un error', async () => {
    fetchProductDetails
      .mockRejectedValueOnce(new Error('Error de prueba'))
      .mockResolvedValueOnce(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el producto')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Intentar de nuevo'))

    expect(fetchProductDetails).toHaveBeenCalledTimes(2)

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeDefined()
      expect(screen.getByText('iPhone 13')).toBeDefined()
    })
  })

  it('muestra un mensaje cuando el producto no se encuentra', async () => {
    fetchProductDetails.mockResolvedValue(null)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('Producto no encontrado')).toBeDefined()
    })
  })
})
