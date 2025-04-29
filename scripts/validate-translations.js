import { getAllTranslations, findMissingTranslations } from '../src/utils/i18nUtils.js'

console.log('🌐 Validando archivos de traducción...')

try {
  const translations = getAllTranslations()
  const missing = findMissingTranslations(translations)
  let hasMissing = false

  Object.keys(missing).forEach(locale => {
    Object.keys(missing[locale]).forEach(otherLocale => {
      if (missing[locale][otherLocale].length > 0) {
        hasMissing = true
        console.log(`\n❌ Claves en "${otherLocale}" que faltan en "${locale}":`)
        missing[locale][otherLocale].forEach(key => {
          console.log(`  - ${key}`)
        })
      }
    })
  })

  if (!hasMissing) {
    console.log('✅ Todos los archivos de traducción están sincronizados.')
  } else {
    console.log('\n⚠️  Se encontraron claves faltantes en los archivos de traducción.')
    console.log(
      '   Por favor, sincronice los archivos de idioma para asegurar una experiencia consistente.'
    )
  }
} catch (error) {
  console.error('❌ Error al validar traducciones:', error)
  process.exit(1)
}
