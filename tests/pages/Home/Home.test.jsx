import { h } from 'preact'
import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { Home } from '../../../src/pages/Home/index'
import { fetchProducts } from '../../../src/services/productService'

vi.mock('../../../src/services/productService', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('../../../src/components/ProductCard/index.jsx', () => ({
  ProductCard: ({ product }) => (
    <div data-testid="product-card" data-product-id={product.id}>
      {product.brand} {product.model}
    </div>
  ),
}))

const mockRoute = vi.fn()
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockRoute,
  }),
}))

vi.mock('../../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'home.title': 'Nuestros Móviles',
        'home.loading': 'Cargando productos...',
        'home.error': 'Error al cargar productos',
        'home.noProducts': 'No hay productos disponibles',
        'home.tryAgain': 'Intentar de nuevo',
        'home.noResults': 'No hay productos disponibles',
        'home.showingAll': 'Mostrando todos los productos',
        'home.search': 'Buscar productos',
        'errors.loadProducts': 'Error al cargar productos',
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

vi.mock('rxjs', () => ({
  fromEvent: vi.fn().mockImplementation(() => ({
    pipe: vi.fn().mockReturnThis(),
    subscribe: fn => {
      fn('')
      return { unsubscribe: vi.fn() }
    },
  })),
  timer: vi.fn().mockImplementation(() => ({
    pipe: vi.fn().mockReturnThis(),
    subscribe: fn => {
      fn()
      return { unsubscribe: vi.fn() }
    },
  })),
}))

vi.mock('rxjs/operators', () => ({
  debounceTime: vi.fn().mockImplementation(() => fn => fn),
  map: vi.fn().mockImplementation(fn => input => fn(input)),
  filter: vi.fn().mockImplementation(fn => input => fn(input)),
  distinctUntilChanged: vi.fn().mockImplementation(() => input => input),
}))

describe('Home Component', () => {
  const mockProducts = [
    {
      id: '1',
      brand: 'Apple',
      model: 'iPhone 13',
      price: 999,
      imgUrl: 'iphone13.jpg',
    },
    {
      id: '2',
      brand: 'Samsung',
      model: 'Galaxy S21',
      price: 899,
      imgUrl: 'galaxy.jpg',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    fetchProducts.mockResolvedValue(mockProducts)
  })

  it('muestra mensaje de carga mientras se cargan los productos', async () => {
    fetchProducts.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProducts), 100))
    )

    render(<Home />)

    expect(screen.getByText('Cargando productos...')).toBeDefined()

    await waitFor(() => {
      expect(screen.queryByText('Cargando productos...')).toBeFalsy()
    })
  })

  it('muestra los productos correctamente cuando se cargan', async () => {
    render(<Home />)

    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(2)
      expect(productCards[0]).toHaveTextContent('Apple iPhone 13')
      expect(productCards[1]).toHaveTextContent('Samsung Galaxy S21')
    })
  })

  it('muestra un mensaje de error cuando falla la carga', async () => {
    fetchProducts.mockRejectedValue(new Error('Error de prueba'))

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeDefined()
      expect(screen.getByText('Intentar de nuevo')).toBeDefined()
    })
  })

  it('permite recargar los productos después de un error', async () => {
    fetchProducts
      .mockRejectedValueOnce(new Error('Error de prueba'))
      .mockResolvedValueOnce(mockProducts)

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Intentar de nuevo'))

    expect(fetchProducts).toHaveBeenCalledTimes(2)

    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(2)
    })
  })

  it('muestra un mensaje cuando no hay productos disponibles', async () => {
    fetchProducts.mockResolvedValue([])

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeDefined()
    })
  })
})
