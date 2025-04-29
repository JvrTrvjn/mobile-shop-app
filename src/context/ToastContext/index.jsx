import { createContext } from 'preact'
import { useContext, useCallback } from 'preact/hooks'
import { ToastContainer, toast as toastify } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const toastDefaultConfig = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  limit: 3,
}

const ToastContext = createContext(null)

/**
 * Proveedor para el sistema de notificaciones toast
 * @param {Object} props - Propiedades del componente
 * @returns {Object} Componente ToastProvider
 */
export function ToastProvider({ children }) {
  const success = useCallback((message, options = {}) => {
    const id = options.toastId || `success-${message}`
    return toastify.success(message, { ...toastDefaultConfig, ...options, toastId: id })
  }, [])

  const error = useCallback((message, options = {}) => {
    const id = options.toastId || `error-${message}`
    return toastify.error(message, { ...toastDefaultConfig, ...options, toastId: id })
  }, [])

  const info = useCallback((message, options = {}) => {
    const id = options.toastId || `info-${message}`
    return toastify.info(message, { ...toastDefaultConfig, ...options, toastId: id })
  }, [])

  const warning = useCallback((message, options = {}) => {
    const id = options.toastId || `warning-${message}`
    return toastify.warning(message, { ...toastDefaultConfig, ...options, toastId: id })
  }, [])

  const contextValue = {
    success,
    error,
    info,
    warning,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
    </ToastContext.Provider>
  )
}

/**
 * Hook personalizado para utilizar el sistema de toast en cualquier componente
 * @returns {Object} Funciones para mostrar diferentes tipos de toast
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider')
  }

  return context
}
