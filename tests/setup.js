import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/preact'
import * as matchers from '@testing-library/jest-dom/matchers'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../src/locales/en.json'
import esTranslations from '../src/locales/es.json'

expect.extend(matchers)

const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    __isMock: true,
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

beforeAll(() => {
  process.env.NODE_ENV = 'test'

  if (!window.localStorage.__isMock) {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })
  }

  window.localStorage.setItem('i18nextLng', 'es')

  if (!document.documentElement.lang) {
    document.documentElement.lang = 'es'
  }

  Object.defineProperty(window.navigator, 'language', {
    value: 'es-ES',
    configurable: true,
  })

  if (i18n.language !== 'es') {
    i18n.changeLanguage('es')
  }
})

afterEach(() => {
  cleanup()

  vi.clearAllMocks()

  window.localStorage.clear()
  window.localStorage.setItem('i18nextLng', 'es')
  if (i18n.language !== 'es') {
    i18n.changeLanguage('es')
  }
})
