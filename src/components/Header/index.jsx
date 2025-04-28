import { useLocation } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { CartCounter } from '../CartCounter'
import './style.css'

/**
 * El componente Header que muestra el titulo, breadcrumbs, y contador del carro
 * @returns {Object} El componente Header
 */
export function Header() {
  const location = useLocation()
  const [currentPath, setCurrentPath] = useState('/')

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
          <h1 className="app-title">Mobile Shop</h1>
        </div>

        <div className="breadcrumb-container">
          {currentPath !== '/' && (
            <div className="breadcrumb">
              <span className="breadcrumb-home" onClick={navigateToHome}>
                Home
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {currentPath.includes('/product/') ? 'Product Details' : 'Not Found'}
              </span>
            </div>
          )}
        </div>

        <div className="cart-container">
          <CartCounter />
        </div>
      </div>
    </header>
  )
}
