import { createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import i18n from '../config/i18n'

const I18nContext = createContext(null)
const LANGUAGE_STORAGE_KEY = 'mobile-shop-language'

const safeLocalStorage = {
  getItem: key => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn(`Error reading from localStorage: ${e.message}`)
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn(`Error writing to localStorage: ${e.message}`)
    }
  },
}

/**
 * Proveedor de contexto para la internacionalización
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.children - Componentes hijos
 * @returns {JSX.Element} El proveedor de contexto I18n
 */
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = safeLocalStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedLanguage || i18n.language
  })

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [])

  useEffect(() => {
    const handleLanguageChanged = lng => {
      setLanguage(lng)
      safeLocalStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  const contextValue = {
    t: (key, options) => i18n.t(key, options),
    i18n,
    changeLanguage: lng => i18n.changeLanguage(lng),
    language,
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

/**
 * Hook personalizado para utilizar las traducciones en cualquier componente
 * @returns {Object} Funciones y métodos para la internacionalización
 */
export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation debe ser usado dentro de un I18nProvider')
  }
  return context
}
