import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import esTranslation from '../locales/es.json'
import enTranslation from '../locales/en.json'

const isTestEnv = process.env.NODE_ENV === 'test'
const isDev = process.env.NODE_ENV === 'development'

const missingKeyHandler = (languages, namespace, key, fallbackValue) => {
  if (isDev) {
    console.warn(
      `[i18n] CLAVE NO TRADUCIDA - Idioma: ${languages}, Clave: ${key}, Valor por defecto: "${fallbackValue}"`
    )
  }
}

const testConfig = {
  detection: { order: [] },
  lng: 'es',
  debug: false,
}

i18n
  .use(isTestEnv ? null : LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslation,
      },
      en: {
        translation: enTranslation,
      },
    },
    fallbackLng: 'es',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    saveMissing: isDev,
    missingKeyHandler,
    ...(isTestEnv ? testConfig : {}),
  })

export default i18n
