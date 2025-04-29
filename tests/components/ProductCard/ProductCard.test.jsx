import { h } from 'preact'
import { render, screen, fireEvent, cleanup } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { ProductCard } from '../../../src/components/ProductCard/index'

const mockRoute = vi.fn()
vi.mock('preact-iso', () => ({
  useLocation: () => ({
    route: mockRoute,
  }),
}))

vi.mock('../../../src/context/I18nContext', () => {
  const I18nProvider = ({ children }) => children

  const useTranslation = () => ({
    t: key => {
      const translations = {
        'product.details': 'Ver detalles',
        'product.priceNotAvailable': 'Precio no disponible',
        'productDetail.viewDetails': 'Ver detalles',
        'productDetail.unavailablePrice': 'Precio no disponible',
        'productDetail.addToCart': 'Añadir al carrito',
      }
      return translations[key] || key
    },
    language: 'es',
  })

  return {
    I18nProvider,
    useTranslation,
  }
})

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('no renderiza nada si el producto es nulo', () => {
    const { container } = render(<ProductCard product={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza correctamente los datos del producto', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Apple')).toBeDefined()
    expect(screen.getByText('iPhone 13')).toBeDefined()
    expect(screen.getByText('999€')).toBeDefined()
    expect(screen.getByAltText('Apple iPhone 13')).toBeDefined()

    const detailButton = document.querySelector('.product-detail-button')
    expect(detailButton).toBeDefined()
  })

  it('muestra un placeholder cuando no hay imagen', () => {
    const productWithoutImage = {
      ...mockProduct,
      imgUrl: null,
    }

    render(<ProductCard product={productWithoutImage} />)

    expect(screen.queryByAltText('Apple iPhone 13')).toBeNull()
    const placeholder = document.querySelector('.product-image-placeholder')
    expect(placeholder).not.toBeNull()
  })

  it('muestra "Precio no disponible" cuando no hay precio', () => {
    const productWithoutPrice = {
      ...mockProduct,
      price: null,
    }

    render(<ProductCard product={productWithoutPrice} />)

    const priceElement = document.querySelector('.product-price')
    expect(priceElement).toBeDefined()
  })

  it('navega al detalle del producto al hacer clic en el componente', () => {
    render(<ProductCard product={mockProduct} />)

    const card = screen.getByText('Apple').closest('.product-card')
    fireEvent.click(card)

    expect(mockRoute).toHaveBeenCalledWith('/product/1')
  })

  it('navega al detalle del producto al hacer clic en el botón de detalles', () => {
    render(<ProductCard product={mockProduct} />)

    const detailButton = document.querySelector('.product-detail-button')
    expect(detailButton).toBeDefined()
    fireEvent.click(detailButton)

    expect(mockRoute).toHaveBeenCalledWith('/product/1')
  })
})
