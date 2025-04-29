import { useTranslation } from '../../context/I18nContext'
import './style.css'

/**
 * Componente selector de idioma que permite cambiar entre los idiomas disponibles
 * @returns {Object} Componente LanguageSelector
 */
export function LanguageSelector() {
  const { changeLanguage, language } = useTranslation()

  const handleChange = lang => {
    console.log('Cambiando idioma a:', lang)
    changeLanguage(lang)
  }

  return (
    <div className="language-selector">
      <button
        className={language.startsWith('es') ? 'active' : ''}
        onClick={() => handleChange('es')}
      >
        ES
      </button>
      <button
        className={language.startsWith('en') ? 'active' : ''}
        onClick={() => handleChange('en')}
      >
        EN
      </button>
    </div>
  )
}
