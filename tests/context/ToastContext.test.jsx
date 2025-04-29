import { render, act, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, useToast } from '../../src/context/ToastContext'
import { wrapWithI18n } from '../helpers/i18n-helper'

// Mock react-toastify para evitar problemas de hooks
vi.mock('react-toastify', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      dismiss: vi.fn(),
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
      <button data-testid="show-warning" onClick={() => toast.warning('Mensaje de advertencia')}>
        Mostrar advertencia
      </button>
      <button data-testid="hide-toast" onClick={() => toast.dismiss()}>
        Ocultar toast
      </button>
    </div>
  )
}

describe('ToastContext', () => {
  let toastContext
  const onRender = ctx => {
    toastContext = ctx
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa correctamente el contexto de toast', () => {
    render(
      wrapWithI18n(
        <ToastProvider>
          <TestComponent onRender={onRender} />
        </ToastProvider>
      )
    )

    expect(toastContext).toBeDefined()
    expect(typeof toastContext.success).toBe('function')
    expect(typeof toastContext.error).toBe('function')
    expect(typeof toastContext.warning).toBe('function')
    expect(typeof toastContext.info).toBe('function')
  })

  it('muestra un toast de éxito', () => {
    render(
      wrapWithI18n(
        <ToastProvider>
          <TestComponent onRender={onRender} />
        </ToastProvider>
      )
    )

    fireEvent.click(screen.getByTestId('show-success'))
    expect(toastContext.success).toHaveBeenCalledWith('Mensaje de éxito', {})
  })

  it('muestra un toast de error', () => {
    render(
      wrapWithI18n(
        <ToastProvider>
          <TestComponent onRender={onRender} />
        </ToastProvider>
      )
    )

    fireEvent.click(screen.getByTestId('show-error'))
    expect(toastContext.error).toHaveBeenCalledWith('Mensaje de error', {})
  })

  it('muestra un toast de advertencia', () => {
    render(
      wrapWithI18n(
        <ToastProvider>
          <TestComponent onRender={onRender} />
        </ToastProvider>
      )
    )

    fireEvent.click(screen.getByTestId('show-warning'))
    expect(toastContext.warning).toHaveBeenCalledWith('Mensaje de advertencia', {})
  })
})
