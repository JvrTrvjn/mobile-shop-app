import { h } from 'preact'
import { render, screen, fireEvent, act } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { AddToCartButton } from '../../../src/components/AddToCartButton/index'

const mockAddToCart = vi.fn()
vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
  }),
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}
vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => mockToast,
}))

vi.mock('../../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'productDetail.add': 'Añadir al carrito',
        'productDetail.adding': 'Añadiendo...',
        'cart.selectColor': 'Selecciona un color',
        'cart.selectStorage': 'Selecciona almacenamiento',
        'cart.selectOptions': 'Selecciona color y almacenamiento',
        'cart.addedSuccessfully': 'Añadido:',
        'cart.error': 'Error al añadir al carrito',
        'cart.priceNotAvailable': 'Precio no disponible',
      }
      return translations[key] || key
    },
    language: 'es',
  }),
}))

describe('AddToCartButton Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddToCart.mockResolvedValue({ count: 1 })
  })

  it('renderiza el botón correctamente', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    expect(screen.getByText('Añadir al carrito')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('-')).toBeDefined()
    expect(screen.getByText('+')).toBeDefined()
  })

  it('incrementa la cantidad al hacer clic en el botón +', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    fireEvent.click(screen.getByText('+'))

    expect(screen.getByText('2')).toBeDefined()
  })

  it('decrementa la cantidad al hacer clic en el botón -', async () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('2')).toBeDefined()

    fireEvent.click(screen.getByText('-'))

    expect(screen.getByText('1')).toBeDefined()
  })

  it('no decrementa por debajo de 1', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    fireEvent.click(screen.getByText('-'))

    expect(screen.getByText('1')).toBeDefined()
  })

  it('muestra un mensaje cuando no se ha seleccionado color', () => {
    render(<AddToCartButton product={mockProduct} selectedColor={null} selectedStorage="64" />)

    expect(screen.getByText('Selecciona un color')).toBeDefined()

    const button = screen.getByText('Añadir al carrito')
    expect(button.disabled).toBe(true)
  })

  it('muestra un mensaje cuando no se ha seleccionado almacenamiento', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage={null} />)

    expect(screen.getByText('Selecciona almacenamiento')).toBeDefined()

    const button = screen.getByText('Añadir al carrito')
    expect(button.disabled).toBe(true)
  })

  it('muestra un mensaje cuando no se ha seleccionado ni color ni almacenamiento', () => {
    render(<AddToCartButton product={mockProduct} selectedColor={null} selectedStorage={null} />)

    expect(screen.getByText('Selecciona color y almacenamiento')).toBeDefined()

    const button = screen.getByText('Añadir al carrito')
    expect(button.disabled).toBe(true)
  })

  it('el botón está deshabilitado cuando no hay selecciones completas', () => {
    render(<AddToCartButton product={mockProduct} selectedColor={null} selectedStorage={null} />)

    const button = screen.getByText('Añadir al carrito')
    expect(button.disabled).toBe(true)
    expect(button.classList.contains('disabled')).toBe(true)
  })

  it('llama a addToCart con los parámetros correctos', async () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const addButton = screen.getByText('Añadir al carrito')

    await act(async () => {
      fireEvent.click(addButton)
    })

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1, '1000', '64')
  })

  it('maneja errores al añadir al carrito', async () => {
    const errorMessage = 'Error de prueba'
    mockAddToCart.mockRejectedValueOnce(new Error(errorMessage))

    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const addButton = screen.getByText('Añadir al carrito')

    await act(async () => {
      fireEvent.click(addButton)
      await new Promise(process.nextTick)
    })

    expect(mockToast.error).toHaveBeenCalled()
  })
})

describe('AddToCartButton - Tests Simplificados', () => {
  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddToCart.mockResolvedValue({ count: 1 })
  })

  it('funciona correctamente con opciones válidas', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const button = screen.getByText('Añadir al carrito')
    expect(button).toBeDefined()
    expect(button.disabled).toBe(false)

    expect(screen.getByText('1')).toBeDefined()

    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('2')).toBeDefined()

    fireEvent.click(button)

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 2, '1000', '64')
  })

  it('muestra mensajes apropiados cuando faltan opciones', () => {
    render(<AddToCartButton product={mockProduct} selectedColor={null} selectedStorage={null} />)

    expect(screen.getByText('Selecciona color y almacenamiento')).toBeDefined()

    const button = screen.getByText('Añadir al carrito')
    expect(button.disabled).toBe(true)
  })
})
