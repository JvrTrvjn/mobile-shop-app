import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { Header } from '../../../src/components/Header/index'

vi.mock('../../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'header.title': 'Mobile Shop',
        'header.home': 'Home',
        'breadcrumb.home': 'Home',
        'breadcrumb.product': 'Product Details',
        'breadcrumb.notFound': 'Not Found',
      }
      return translations[key] || key
    },
    language: 'es',
    changeLanguage: vi.fn(),
  }),
}))

vi.mock('../../../src/components/CartCounter', () => ({
  CartCounter: () => <div data-testid="cart-counter">Cart Counter</div>,
}))

vi.mock('../../../src/components/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language Selector</div>,
}))

let mockUrl = '/'
const mockRoute = vi.fn()

vi.mock('preact-iso', () => ({
  useLocation: () => ({
    url: mockUrl,
    route: mockRoute,
  }),
}))

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUrl = '/'
  })

  it('renderiza correctamente el título de la aplicación', () => {
    render(<Header />)

    expect(screen.getByText('Mobile Shop')).toBeDefined()
  })

  it('navega a la página principal al hacer clic en el logo', () => {
    render(<Header />)

    const logo = screen.getByText('Mobile Shop').closest('.logo-container')
    fireEvent.click(logo)

    expect(mockRoute).toHaveBeenCalledWith('/')
  })

  it('no muestra breadcrumbs en la página principal', () => {
    render(<Header />)

    const breadcrumbs = screen.queryByText('Home')
    expect(breadcrumbs).toBeNull()
  })

  it('muestra breadcrumbs en páginas de producto', () => {
    mockUrl = '/product/1'

    render(<Header />)

    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Product Details')).toBeDefined()
  })

  it('muestra "Not Found" en breadcrumbs para rutas desconocidas', () => {
    mockUrl = '/unknown-route'

    render(<Header />)

    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Not Found')).toBeDefined()
  })

  it('incluye el componente CartCounter', () => {
    render(<Header />)

    expect(screen.getByTestId('cart-counter')).toBeDefined()
  })

  it('incluye el componente LanguageSelector', () => {
    render(<Header />)

    expect(screen.getByTestId('language-selector')).toBeDefined()
  })
})
