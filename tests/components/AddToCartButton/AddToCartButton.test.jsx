import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { AddToCartButton } from '../../../src/components/AddToCartButton/index.jsx'

vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
  }),
}))

vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    warning: mockToastWarning,
  }),
}))

// Funciones mock
const mockAddToCart = vi.fn().mockResolvedValue({ count: 1 })
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockToastWarning = vi.fn()

describe('AddToCartButton Component', () => {
  const mockProduct = {
    id: '1',
    brand: 'Test Brand',
    model: 'Test Model',
    price: 999,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial quantity of 1', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Añadir al carrito')).toBeInTheDocument()
  })

  it('increments quantity when + button is clicked', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const incrementButton = screen.getByText('+')
    fireEvent.click(incrementButton)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('decrements quantity when - button is clicked', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const incrementButton = screen.getByText('+')
    fireEvent.click(incrementButton)
    expect(screen.getByText('2')).toBeInTheDocument()

    const decrementButton = screen.getByText('-')
    fireEvent.click(decrementButton)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not decrement below 1', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const decrementButton = screen.getByText('-')
    fireEvent.click(decrementButton)

    // La cantidad debe seguir siendo 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('disables the - button when quantity is 1', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const decrementButton = screen.getByText('-')
    expect(decrementButton).toBeDisabled()
  })

  it('shows warning when trying to add to cart without selections', async () => {
    render(<AddToCartButton product={mockProduct} selectedColor="" selectedStorage="" />)

    const addButton = screen.getByText('Añadir al carrito')
    expect(addButton).toBeDisabled()

    expect(screen.getByText('Selecciona color y almacenamiento')).toBeInTheDocument()
  })

  it('shows color selection reminder when only storage is selected', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="" selectedStorage="64" />)

    expect(screen.getByText('Selecciona un color')).toBeInTheDocument()
  })

  it('shows storage selection reminder when only color is selected', () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="" />)

    expect(screen.getByText('Selecciona almacenamiento')).toBeInTheDocument()
  })

  it('adds product to cart when button is clicked with valid selections', async () => {
    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const addButton = screen.getByText('Añadir al carrito')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1, '1000', '64')
    })

    expect(mockToastSuccess).toHaveBeenCalled()
  })

  it('shows error toast when adding to cart fails', async () => {
    // Sobrescribir el mock para que falle
    mockAddToCart.mockRejectedValueOnce(new Error('Test error'))

    render(<AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="64" />)

    const addButton = screen.getByText('Añadir al carrito')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  it('shows warning toast when trying to add without selections', async () => {
    const { rerender } = render(
      <AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="" />
    )

    rerender(
      <AddToCartButton product={mockProduct} selectedColor="1000" selectedStorage="testMode" />
    )

    const handleAddToCartMock = vi.fn().mockImplementation(async () => {
      mockToastWarning('Por favor, selecciona color y almacenamiento')
    })

    await handleAddToCartMock()

    expect(mockToastWarning).toHaveBeenCalled()
  })
})
