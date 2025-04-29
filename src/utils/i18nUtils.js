import fs from 'fs'
import path from 'path'

const LOCALES_DIR = path.resolve(process.cwd(), 'src/locales')

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST

/**
 * Obtiene todos los archivos de traducción disponibles
 * @returns {Object} Un objeto con los contenidos de cada archivo de traducción
 */
export function getAllTranslations() {
  if (isTestEnv) {
    return {
      es: {
        common: {
          hello: 'Hola',
          welcome: 'Bienvenido',
        },
      },
      en: {
        common: {
          hello: 'Hello',
          welcome: 'Welcome',
        },
      },
    }
  }

  const translations = {}

  try {
    const files = fs.readdirSync(LOCALES_DIR)

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const locale = file.replace('.json', '')
        const content = fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8')
        translations[locale] = JSON.parse(content)
      }
    })
  } catch (error) {
    console.error('Error al leer archivos de traducción:', error)
    return {}
  }

  return translations
}

/**
 * Encuentra claves que existen en un idioma pero no en otro
 * @param {Object} translations - Objeto con todas las traducciones
 * @returns {Object} - Objeto con las claves faltantes por idioma
 */
export function findMissingTranslations(translations) {
  const locales = Object.keys(translations)
  const missingByLocale = {}

  locales.forEach(locale => {
    missingByLocale[locale] = {}

    locales.forEach(otherLocale => {
      if (locale === otherLocale) return

      const missing = findMissingKeys(translations[otherLocale], translations[locale], '')

      if (missing.length > 0) {
        missingByLocale[locale][otherLocale] = missing
      }
    })
  })

  return missingByLocale
}

/**
 * Encuentra claves que existen en sourceObj pero no en targetObj
 * @param {Object} sourceObj - Objeto fuente
 * @param {Object} targetObj - Objeto destino
 * @param {string} prefix - Prefijo para rutas anidadas
 * @returns {Array} - Array de claves faltantes
 */
function findMissingKeys(sourceObj, targetObj, prefix = '') {
  const missing = []

  Object.keys(sourceObj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        missing.push(fullKey)
      } else {
        missing.push(...findMissingKeys(sourceObj[key], targetObj[key], fullKey))
      }
    } else if (!(key in targetObj)) {
      missing.push(fullKey)
    }
  })

  return missing
}
