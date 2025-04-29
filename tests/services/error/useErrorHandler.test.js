import { render, act } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { useErrorHandler } from '../../../src/services/error/useErrorHandler'
import { ErrorService } from '../../../src/services/error/errorService'
import logger from '../../../src/utils/logger'

const mockToast = {
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
}

vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => mockToast,
}))

vi.mock('../../../src/services/error/errorService', () => ({
  ErrorService: {
    handleApiError: vi.fn().mockImplementation((error, fallbackMessage) => ({
      message: fallbackMessage || 'Error de API por defecto',
      originalError: error,
    })),
    handleValidationError: vi.fn().mockImplementation((field, message) => ({
      field,
      message: `Error de validación: ${message || field + ' inválido'}`,
    })),
    handleCacheError: vi.fn().mockImplementation((error, action) => ({
      message: `Error en la caché durante ${action}`,
      originalError: error,
    })),
  },
}))

vi.mock('../../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
  },
}))

function TestComponent({ onHookReady }) {
  const errorHandler = useErrorHandler()

  if (onHookReady) {
    onHookReady(errorHandler)
  }

  return <div>Test component</div>
}

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registra errores generales y notifica al usuario', async () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    expect(handler).toBeDefined()

    const testError = new Error('Error general de prueba')

    await act(async () => {
      handler.notifyError(testError)
    })

    expect(logger.error).toHaveBeenCalledWith('Error general de prueba', testError)

    expect(mockToast.error).toHaveBeenCalledWith('Error general de prueba', undefined)
  })

  it('no muestra toast si la opción silent es true', async () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    const testError = new Error('Error silencioso')

    await act(async () => {
      handler.notifyError(testError, { silent: true })
    })

    expect(logger.error).toHaveBeenCalled()
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('delega los errores de API al ErrorService', async () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    const testError = new Error('Error API')

    await act(async () => {
      handler.notifyApiError(testError, 'Mensaje fallback API')
    })

    expect(ErrorService.handleApiError).toHaveBeenCalledWith(testError, 'Mensaje fallback API')

    expect(mockToast.error).toHaveBeenCalled()
  })

  it('maneja errores de validación', async () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    await act(async () => {
      handler.notifyValidationError('email', 'Formato incorrecto')
    })

    expect(ErrorService.handleValidationError).toHaveBeenCalledWith('email', 'Formato incorrecto')

    expect(mockToast.warning).toHaveBeenCalled()
  })

  it('maneja errores de caché', async () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    const testError = new Error('Error caché')

    await act(async () => {
      handler.notifyCacheError(testError, 'guardar')
    })

    expect(ErrorService.handleCacheError).toHaveBeenCalledWith(testError, 'guardar')

    expect(mockToast.error).toHaveBeenCalled()
  })
})

describe('useErrorHandler - Tests Simplificados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('notifica errores generales correctamente', () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    expect(handler).toBeDefined()

    const testError = new Error('Error de prueba simplificado')

    handler.notifyError(testError)

    expect(logger.error).toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalled()
  })

  it('maneja errores de API con un mensaje personalizado', () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    const apiError = new Error('Error de API')

    handler.notifyApiError(apiError, 'Error al comunicarse con el servidor')

    expect(ErrorService.handleApiError).toHaveBeenCalledWith(
      apiError,
      'Error al comunicarse con el servidor'
    )

    expect(mockToast.error).toHaveBeenCalled()
  })

  it('maneja errores de validación en modo silencioso', () => {
    let handler

    render(
      <TestComponent
        onHookReady={h => {
          handler = h
        }}
      />
    )

    handler.notifyValidationError('password', 'La contraseña es muy corta', { silent: true })

    expect(ErrorService.handleValidationError).toHaveBeenCalledWith(
      'password',
      'La contraseña es muy corta'
    )

    expect(mockToast.warning).not.toHaveBeenCalled()
  })
})
