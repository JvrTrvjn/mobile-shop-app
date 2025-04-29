import { useCallback } from 'preact/hooks'
import { useToast } from '../../context/ToastContext'
import { ErrorService } from './errorService'
import logger from '../../utils/logger'

/**
 * Hook para manejar errores en componentes
 * Proporciona métodos para notificar diferentes tipos de errores al usuario
 * y registrarlos en el sistema de logs
 *
 * @returns {Object} Métodos para manejar diferentes tipos de errores
 */
export function useErrorHandler() {
  const toast = useToast()

  const notifyError = useCallback(
    (error, options = {}) => {
      const message = error.message || 'Ha ocurrido un error'
      logger.error(message, error)

      if (!options.silent) {
        toast.error(message, options.toastOptions)
      }

      return error
    },
    [toast]
  )

  const notifyApiError = useCallback(
    (error, fallbackMessage, options = {}) => {
      const errorObj = ErrorService.handleApiError(error, fallbackMessage)

      if (!options.silent) {
        toast.error(errorObj.message, options.toastOptions)
      }

      return errorObj
    },
    [toast]
  )

  const notifyValidationError = useCallback(
    (field, message, options = {}) => {
      const error = ErrorService.handleValidationError(field, message)

      if (!options.silent) {
        toast.warning(error.message, options.toastOptions)
      }

      return error
    },
    [toast]
  )

  const notifyCacheError = useCallback(
    (error, action, options = {}) => {
      const errorObj = ErrorService.handleCacheError(error, action)

      if (!options.silent) {
        toast.error(errorObj.message, options.toastOptions)
      }

      return errorObj
    },
    [toast]
  )

  return {
    notifyError,
    notifyApiError,
    notifyValidationError,
    notifyCacheError,
  }
}
