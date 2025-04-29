import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { ToastProvider, useToast } from '../../src/context/ToastContext'

vi.mock('react-toastify', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    ToastContainer: () => null,
  }
})

const TestComponent = ({ onRender }) => {
  const toast = useToast()

  onRender(toast)

  return (
    <div>
      <button data-testid="show-success" onClick={() => toast.success('Mensaje de éxito')}>
        Mostrar éxito
      </button>
      <button data-testid="show-error" onClick={() => toast.error('Mensaje de error')}>
        Mostrar error
      </button>
    </div>
  )
}

describe('ToastContext - Tests Mejorados', () => {
  let toastContext
  const onRender = ctx => {
    toastContext = ctx
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('proporciona las funciones de toast y las ejecuta correctamente', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    expect(toastContext).toBeDefined()
    expect(typeof toastContext.success).toBe('function')
    expect(typeof toastContext.error).toBe('function')

    const { toast } = require('react-toastify')

    fireEvent.click(screen.getByTestId('show-success'))

    expect(toast.success).toHaveBeenCalledWith('Mensaje de éxito', expect.any(Object))

    fireEvent.click(screen.getByTestId('show-error'))

    expect(toast.error).toHaveBeenCalledWith('Mensaje de error', expect.any(Object))
  })
})
