import { h } from 'preact'
import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi } from 'vitest'
import { Breadcrumb } from '../../../src/components/Breadcrumb/index'

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
        'breadcrumb.home': 'Home',
        'breadcrumb.product': 'Product Details',
        'breadcrumb.products': 'Products',
        'breadcrumb.notFound': 'Not Found',
      }
      return translations[key] || key
    },
    language: 'es',
  }),
}))

describe('Breadcrumb Component', () => {
  it('no renderiza nada cuando no se proporcionan items', () => {
    const { container } = render(<Breadcrumb />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada cuando se proporciona un array vacío', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza correctamente un solo item', () => {
    const items = [{ label: 'breadcrumb.home' }]
    render(<Breadcrumb items={items} />)

    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.queryByText('/')).toBeNull()
  })

  it('renderiza múltiples items con separadores', () => {
    const items = [
      { label: 'breadcrumb.home', path: '/' },
      { label: 'breadcrumb.products', path: '/products' },
      { label: 'breadcrumb.product' },
    ]
    render(<Breadcrumb items={items} />)

    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Products')).toBeDefined()
    expect(screen.getByText('Product Details')).toBeDefined()

    const separators = screen.queryAllByText('/')
    expect(separators.length).toBe(2)
  })

  it('navega al hacer clic en un item con path', () => {
    const items = [
      { label: 'breadcrumb.home', path: '/' },
      { label: 'breadcrumb.products', path: '/products' },
      { label: 'breadcrumb.product' },
    ]
    render(<Breadcrumb items={items} />)

    fireEvent.click(screen.getByText('Home'))
    expect(mockRoute).toHaveBeenCalledWith('/')

    fireEvent.click(screen.getByText('Products'))
    expect(mockRoute).toHaveBeenCalledWith('/products')
  })

  it('no navega al hacer clic en el último item aunque tenga path', () => {
    const items = [
      { label: 'breadcrumb.home', path: '/' },
      { label: 'breadcrumb.product', path: '/product/1' },
    ]
    render(<Breadcrumb items={items} />)

    const lastItem = screen.getByText('Product Details')
    expect(lastItem.closest('.breadcrumb-link')).toBeNull()

    fireEvent.click(screen.getByText('Home'))
    expect(mockRoute).toHaveBeenCalledWith('/')
  })

  it('aplica las clases CSS correctas a los elementos', () => {
    const items = [
      { label: 'breadcrumb.home', path: '/' },
      { label: 'breadcrumb.products', path: '/products' },
      { label: 'breadcrumb.product' },
    ]
    render(<Breadcrumb items={items} />)

    expect(screen.getByText('Home').className).toBe('breadcrumb-link')
    expect(screen.getByText('Products').className).toBe('breadcrumb-link')
    expect(screen.getByText('Product Details').className).toBe('breadcrumb-text')
  })
})
