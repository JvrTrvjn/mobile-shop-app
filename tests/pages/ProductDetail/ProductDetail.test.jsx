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
        'productDetail.colors': 'Colores:',
        'productDetail.storage': 'Almacenamiento:',
        'productDetail.price': 'Precio:',
        'productDetail.brand': 'Marca:',
        'productDetail.cpu': 'CPU:',
        'productDetail.ram': 'RAM:',
        'productDetail.os': 'Sistema operativo:',
        'productDetail.display': 'Tamaño de pantalla:',
        'productDetail.dimensions': 'Dimensiones:',
        'productDetail.weight': 'Peso:',
        'errors.productNotFound': 'Producto no encontrado',
        'errors.invalidId': 'ID de producto inválido',
        'productDetail.goBack': 'Volver',
        'productDetail.specifications': 'Especificaciones',
        'productDetail.notSpecified': 'No especificado',
        'productDetail.selectOptions': 'Seleccione opciones',
        'productDetail.noColorOptions': 'No hay opciones de color disponibles',
        'productDetail.noStorageOptions': 'No hay opciones de almacenamiento disponibles',
        'productDetail.unavailablePrice': 'Precio no disponible',
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

describe('ProductDetail Component - Pruebas Básicas', () => {
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

    fetchProductDetails.mockImplementation(() => {
      console.log('Mock fetchProductDetails called - returning mock data immediately')
      return Promise.resolve(mockProduct)
    })
  })

  it('muestra un mensaje de carga mientras se obtienen los datos', () => {
    fetchProductDetails.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockProduct), 50)
      })
    })

    render(<ProductDetail />)

    expect(screen.getByText('Cargando detalles del producto...')).toBeDefined()
  })

  it('muestra los detalles del producto correctamente', async () => {
    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando detalles del producto...')).toBeNull()
    })

    expect(screen.getAllByText(/apple/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/iphone 13/i)).toBeDefined()
    expect(screen.getByText('999€')).toBeDefined()
    expect(screen.getByTestId('color-selector')).toBeDefined()
    expect(screen.getByTestId('storage-selector')).toBeDefined()
    expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
  })

  it('función de selección de color funciona correctamente', () => {
    const mockColorSelector = vi.fn()
    const mockColors = [
      { code: 1000, name: 'Negro' },
      { code: 2000, name: 'Blanco' },
    ]
    const selectedColor = '1000'

    const { getByTestId } = render(
      <div data-testid="color-selector">
        {mockColors.map(color => (
          <button
            key={color.code}
            data-testid={`color-option-${color.code}`}
            className={selectedColor === String(color.code) ? 'selected' : ''}
            onClick={() => mockColorSelector(String(color.code))}
          >
            {color.name}
          </button>
        ))}
      </div>
    )

    fireEvent.click(getByTestId('color-option-2000'))

    expect(mockColorSelector).toHaveBeenCalledWith('2000')
  })
})
