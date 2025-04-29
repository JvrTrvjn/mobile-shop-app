import { createContext } from 'preact'
import { useContext, useState, useCallback } from 'preact/hooks'
import { ToastContainer, toast as toastify } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Creamos el contexto
const ToastContext = createContext(null)

/**
 * Proveedor para el sistema de notificaciones toast
 * @param {Object} props - Propiedades del componente
 * @returns {Object} Componente ToastProvider
 */
export function ToastProvider({ children }) {
  // Métodos de notificación que envuelven la librería react-toastify
  const success = useCallback((message, options = {}) => {
    return toastify.success(message, options)
  }, [])

  const error = useCallback((message, options = {}) => {
    return toastify.error(message, options)
  }, [])

  const info = useCallback((message, options = {}) => {
    return toastify.info(message, options)
  }, [])

  const warning = useCallback((message, options = {}) => {
    return toastify.warning(message, options)
  }, [])

  // Valores del contexto
  const contextValue = {
    success,
    error,
    info,
    warning
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