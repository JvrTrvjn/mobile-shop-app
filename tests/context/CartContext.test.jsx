import { render, act } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { CartProvider, useCart } from '../../src/context/CartContext'
import { getCartCount, addProductToCart } from '../../src/services/productService'

vi.mock('../../src/services/productService', () => ({
  getCartCount: vi.fn(),
  updateCartCount: vi.fn(),
  addProductToCart: vi.fn(),
}))

vi.mock('../../src/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'cart.errorAdding': 'No se pudo añadir el producto al carrito. Inténtalo de nuevo.',
      }
      return translations[key] || key
    },
    language: 'es',
  }),
}))

const TestComponent = ({ onRender }) => {
  const cartContext = useCart()
  onRender(cartContext)
  return <div>Test Component</div>
}

describe('CartContext', () => {
  let cartContext
  const onRender = ctx => {
    cartContext = ctx
  }

  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    vi.mocked(getCartCount).mockReturnValue(0)
    vi.mocked(addProductToCart).mockResolvedValue({ count: 1 })
  })

  it('inicializa el carrito con contador en 0', () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    expect(cartContext.state.count).toBe(0)
    expect(cartContext.state.total).toBe(0)
    expect(cartContext.state.items).toEqual([])
  })

  it('añade un producto al carrito', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    expect(cartContext.state.count).toBe(1)
    expect(cartContext.state.total).toBe(999)
    expect(cartContext.state.items).toHaveLength(1)
    expect(cartContext.state.items[0].id).toBe('1')
    expect(cartContext.state.items[0].quantity).toBe(1)
    expect(cartContext.state.items[0].selectedColor).toBe('1000')
    expect(cartContext.state.items[0].selectedStorage).toBe('64')

    expect(addProductToCart).toHaveBeenCalledWith({
      id: '1',
      colorCode: 1000,
      storageCode: 64,
    })
  })

  it('actualiza la cantidad si el mismo producto se añade de nuevo', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    await act(async () => {
      await cartContext.addToCart(mockProduct, 2, '1000', '64')
    })

    expect(cartContext.state.count).toBe(3)
    expect(cartContext.state.total).toBe(2997)
    expect(cartContext.state.items).toHaveLength(1)
    expect(cartContext.state.items[0].quantity).toBe(3)
  })

  it('añade productos diferentes como elementos separados', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '2000', '64')
    })

    expect(cartContext.state.count).toBe(2)
    expect(cartContext.state.total).toBe(1998)
    expect(cartContext.state.items).toHaveLength(2)
    expect(cartContext.state.items[0].selectedColor).toBe('1000')
    expect(cartContext.state.items[1].selectedColor).toBe('2000')
  })

  it('elimina un producto del carrito', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    act(() => {
      cartContext.removeFromCart(0)
    })

    expect(cartContext.state.count).toBe(0)
    expect(cartContext.state.total).toBe(0)
    expect(cartContext.state.items).toHaveLength(0)
  })

  it('actualiza la cantidad de un producto', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    act(() => {
      cartContext.updateQuantity(0, 3)
    })

    expect(cartContext.state.count).toBe(3)
    expect(cartContext.state.total).toBe(2997)
    expect(cartContext.state.items).toHaveLength(1)
    expect(cartContext.state.items[0].quantity).toBe(3)
  })

  it('limpia el carrito completamente', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 2, '1000', '64')
      await cartContext.addToCart(mockProduct, 1, '2000', '128')
    })

    act(() => {
      cartContext.clearCart()
    })

    expect(cartContext.state.count).toBe(0)
    expect(cartContext.state.total).toBe(0)
    expect(cartContext.state.items).toHaveLength(0)
  })

  it('maneja los errores al añadir un producto', async () => {
    vi.mocked(addProductToCart).mockRejectedValueOnce(new Error('API Error'))

    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    let error
    await act(async () => {
      try {
        await cartContext.addToCart(mockProduct, 1, '1000', '64')
      } catch (err) {
        error = err
      }
    })

    expect(error).toBeDefined()
    expect(error.message).toBe('No se pudo añadir el producto al carrito. Inténtalo de nuevo.')
  })

  it('rechaza añadir un producto con códigos inválidos', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    let error
    await act(async () => {
      try {
        await cartContext.addToCart(mockProduct, 1, 'invalid', '64')
      } catch (err) {
        error = err
      }
    })

    expect(error).toBeDefined()
    expect(error.message).toBe('No se pudo añadir el producto al carrito. Inténtalo de nuevo.')
  })

  it('sincroniza el contador del carrito con el servidor', async () => {
    vi.mocked(addProductToCart).mockResolvedValueOnce({ count: 5 })

    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    expect(cartContext.state.count).toBe(5)
  })
})

describe('CartContext - Tests Simplificados', () => {
  let cartContext
  const onRender = ctx => {
    cartContext = ctx
  }

  const mockProduct = {
    id: '1',
    brand: 'Apple',
    model: 'iPhone 13',
    price: 999,
    imgUrl: 'iphone13.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    vi.mocked(getCartCount).mockReturnValue(0)
    vi.mocked(addProductToCart).mockResolvedValue({ count: 1 })
  })

  it('proporciona un estado inicial del carrito vacío', () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    expect(cartContext.state.count).toBe(0)
    expect(cartContext.state.items.length).toBe(0)
    expect(cartContext.state.total).toBe(0)
  })

  it('permite añadir productos al carrito', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    const addPromise = Promise.resolve({ count: 1 })
    vi.mocked(addProductToCart).mockReturnValue(addPromise)

    await act(async () => {
      await cartContext.addToCart(mockProduct, 1, '1000', '64')
    })

    expect(cartContext.state.count).toBe(1)
    expect(cartContext.state.items.length).toBe(1)
    expect(cartContext.state.total).toBe(999)

    expect(addProductToCart).toHaveBeenCalledWith({
      id: '1',
      colorCode: 1000,
      storageCode: 64,
    })
  })

  it('maneja los errores al añadir productos', async () => {
    render(
      <CartProvider>
        <TestComponent onRender={onRender} />
      </CartProvider>
    )

    const errorPromise = Promise.reject(new Error('API Error'))
    vi.mocked(addProductToCart).mockReturnValue(errorPromise)

    let error
    await act(async () => {
      try {
        await cartContext.addToCart(mockProduct, 1, '1000', '64')
      } catch (err) {
        error = err
      }
    })

    expect(error).toBeDefined()
  })
})
