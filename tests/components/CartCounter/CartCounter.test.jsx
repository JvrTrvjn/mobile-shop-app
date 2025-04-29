import { render, act } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { CartCounter } from '../../../src/components/CartCounter/index.jsx'

vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => ({
    state: { count: mockCartCount },
  }),
}))

vi.mock('../../../src/services/productService', () => ({
  getCartCount: () => mockStoredCartCount,
}))

vi.mock('../../../src/utils/logger', () => ({
  default: {
    log: vi.fn(),
  },
}))

let mockCartCount = 0
let mockStoredCartCount = 0

describe('CartCounter Component', () => {
  beforeEach(() => {
    mockCartCount = 0
    mockStoredCartCount = 0
    vi.clearAllMocks()
  })

  it('renders without count badge when cart is empty', () => {
    const { container } = render(<CartCounter />)

    expect(container.querySelector('.cart-icon')).toBeTruthy()

    const countBadge = container.querySelector('.cart-count')
    expect(countBadge).toBeFalsy()
  })

  it('displays the correct count from cart context', () => {
    mockCartCount = 5

    const { container } = render(<CartCounter />)

    const countBadge = container.querySelector('.cart-count')
    expect(countBadge).toBeTruthy()
    expect(countBadge.textContent).toBe('5')
  })

  it('updates when cart context changes', () => {
    mockCartCount = 0

    const { container, rerender } = render(<CartCounter />)

    expect(container.querySelector('.cart-count')).toBeFalsy()

    mockCartCount = 3
    rerender(<CartCounter />)

    const countBadge = container.querySelector('.cart-count')
    expect(countBadge).toBeTruthy()
    expect(countBadge.textContent).toBe('3')
  })

  it('updates when cartUpdated event is fired', () => {
    mockCartCount = 2
    mockStoredCartCount = 2

    const { container } = render(<CartCounter />)

    expect(container.querySelector('.cart-count').textContent).toBe('2')

    mockStoredCartCount = 7

    act(() => {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    })

    expect(container.querySelector('.cart-count').textContent).toBe('7')
  })

  it('adds and removes event listener correctly', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    const removeEventSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<CartCounter />)

    expect(addEventSpy).toHaveBeenCalledWith('cartUpdated', expect.any(Function))

    unmount()

    expect(removeEventSpy).toHaveBeenCalledWith('cartUpdated', expect.any(Function))
  })
})
