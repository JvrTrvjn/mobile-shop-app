import { render, act, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, useToast } from '../../src/context/ToastContext'

const TestComponent = ({ onRender }) => {
  const { showToast, hideToast, toasts } = useToast()

  onRender({ showToast, hideToast, toasts })

  return (
    <div>
      <button data-testid="show-success" onClick={() => showToast('success', 'Mensaje de éxito')}>
        Mostrar éxito
      </button>
      <button data-testid="show-error" onClick={() => showToast('error', 'Mensaje de error')}>
        Mostrar error
      </button>
      <button
        data-testid="show-warning"
        onClick={() => showToast('warning', 'Mensaje de advertencia')}
      >
        Mostrar advertencia
      </button>
      <button data-testid="hide-toast" onClick={() => hideToast(0)}>
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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicializa sin toasts', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    expect(toastContext.toasts).toEqual([])
  })

  it('muestra un toast de éxito', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-success'))

    expect(toastContext.toasts).toHaveLength(1)
    expect(toastContext.toasts[0].type).toBe('success')
    expect(toastContext.toasts[0].message).toBe('Mensaje de éxito')
    expect(toastContext.toasts[0].id).toBeDefined()
  })

  it('muestra un toast de error', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-error'))

    expect(toastContext.toasts).toHaveLength(1)
    expect(toastContext.toasts[0].type).toBe('error')
    expect(toastContext.toasts[0].message).toBe('Mensaje de error')
  })

  it('muestra un toast de advertencia', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-warning'))

    expect(toastContext.toasts).toHaveLength(1)
    expect(toastContext.toasts[0].type).toBe('warning')
    expect(toastContext.toasts[0].message).toBe('Mensaje de advertencia')
  })

  it('oculta un toast específico', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-success'))
    fireEvent.click(screen.getByTestId('show-error'))

    expect(toastContext.toasts).toHaveLength(2)

    fireEvent.click(screen.getByTestId('hide-toast'))

    expect(toastContext.toasts).toHaveLength(1)
    expect(toastContext.toasts[0].type).toBe('error')
  })

  it('oculta automáticamente los toasts después del tiempo especificado', () => {
    render(
      <ToastProvider autoHideTime={3000}>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-success'))
    expect(toastContext.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(toastContext.toasts).toHaveLength(0)
  })

  it('mantiene varios toasts independientes', () => {
    render(
      <ToastProvider>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByTestId('show-success'))
    fireEvent.click(screen.getByTestId('show-error'))
    fireEvent.click(screen.getByTestId('show-warning'))

    expect(toastContext.toasts).toHaveLength(3)
    expect(toastContext.toasts[0].type).toBe('success')
    expect(toastContext.toasts[1].type).toBe('error')
    expect(toastContext.toasts[2].type).toBe('warning')
  })

  it('permite establecer un tiempo de auto-ocultación específico para cada toast', () => {
    render(
      <ToastProvider autoHideTime={3000}>
        <TestComponent onRender={onRender} />
      </ToastProvider>
    )

    act(() => {
      toastContext.showToast('success', 'Toast rápido', 1000)
    })

    expect(toastContext.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(toastContext.toasts).toHaveLength(0)

    act(() => {
      toastContext.showToast('error', 'Toast normal')
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(toastContext.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(toastContext.toasts).toHaveLength(0)
  })
})
