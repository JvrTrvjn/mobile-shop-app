import logger from '../../utils/logger'

export class ErrorService {
  /**
   * Maneja errores relacionados con peticiones a la API
   * @param {Error} error - El error original
   * @param {string} fallbackMessage - Mensaje alternativo si no hay mensaje de error
   * @returns {Object} Objeto de error formateado
   */
  static handleApiError(error, fallbackMessage) {
    logger.error('[API Error]', error)
    return {
      message: fallbackMessage || 'Ha ocurrido un error. Inténtelo de nuevo más tarde.',
      originalError: error,
    }
  }

  /**
   * Maneja errores de validación de datos
   * @param {string} fieldName - Nombre del campo que falló la validación
   * @param {string} message - Mensaje de error específico
   * @returns {Object} Objeto de error de validación
   */
  static handleValidationError(fieldName, message) {
    const errorMessage = `Error de validación: ${message || `${fieldName} inválido`}`
    logger.warn('[Validation Error]', errorMessage)
    return {
      field: fieldName,
      message: errorMessage,
    }
  }

  /**
   * Maneja errores en componentes
   * @param {string} component - Nombre del componente donde ocurrió el error
   * @param {Error} error - El error original
   * @param {JSX.Element} fallbackUI - UI alternativa para mostrar en caso de error
   * @returns {JSX.Element|null} UI de fallback o null
   */
  static handleComponentError(component, error, fallbackUI) {
    logger.error(`[Component Error: ${component}]`, error)
    return fallbackUI || null
  }

  /**
   * Maneja errores de caché
   * @param {Error} error - El error original
   * @param {string} action - La acción que se estaba realizando (guardar, recuperar, etc.)
   * @returns {Object} Objeto de error formateado
   */
  static handleCacheError(error, action) {
    logger.error(`[Cache Error: ${action}]`, error)
    return {
      message: `Error en la caché durante ${action}`,
      originalError: error,
    }
  }
}
