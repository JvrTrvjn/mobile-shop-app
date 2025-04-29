import { useLocation } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { CartCounter } from '../CartCounter'
import { LanguageSelector } from '../LanguageSelector'
import { useTranslation } from '../../context/I18nContext'
import './style.css'

/**
 * El componente Header que muestra el titulo, breadcrumbs, y contador del carro
 * @returns {Object} El componente Header
 */
export function Header() {
  const location = useLocation()
  const [currentPath, setCurrentPath] = useState('/')
  const { t } = useTranslation()

  useEffect(() => {
    const pathname = typeof location.url === 'string' ? location.url : window.location.pathname

    setCurrentPath(pathname)
  }, [location])

  const navigateToHome = () => {
    location.route('/')
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container" onClick={navigateToHome}>
          <h1 className="app-title">{t('header.title')}</h1>
        </div>

        <div className="breadcrumb-container">
          {currentPath !== '/' && (
            <div className="breadcrumb">
              <span className="breadcrumb-home" onClick={navigateToHome}>
                {t('header.home')}
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {currentPath.includes('/product/') ? t('ProductDetails') : t('NotFound')}
              </span>
            </div>
          )}
        </div>

        <div className="cart-container">
          <CartCounter />
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
