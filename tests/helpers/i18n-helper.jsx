import { h } from 'preact'
import { I18nProvider } from '../../src/context/I18nContext'
import i18n from 'i18next'

const localStorageMock = (function () {
  let store = {}
  return {
    getItem(key) {
      return store[key] || null
    },
    setItem(key, value) {
      try {
        store[key] = value && value.toString()
      } catch (e) {
        console.warn('Error en mock localStorage.setItem:', e)
      }
    },
    removeItem(key) {
      delete store[key]
    },
    clear() {
      store = {}
    },
    __isMock: true,
  }
})()

if (!window.localStorage.__isMock) {
  try {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })
  } catch (e) {
    console.warn('Error al configurar mock de localStorage:', e)
  }
}

/**
 * Envuelve un componente en el proveedor de i18n para pruebas
 * @param {JSX.Element} children - El componente que se está probando
 * @param {string} initialLanguage - El idioma inicial opcional (por defecto 'es')
 * @returns {JSX.Element} El componente envuelto en I18nProvider
 */
export function wrapWithI18n(children, initialLanguage = 'es') {
  try {
    window.localStorage.setItem('i18nextLng', initialLanguage)

    if (i18n.language !== initialLanguage) {
      i18n.changeLanguage(initialLanguage)
    }
  } catch (e) {
    console.warn('Error al configurar idioma en localStorage para tests:', e)
  }

  return h(I18nProvider, { initialLanguage, forceInitialize: true }, children)
}
