import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'
import { Home } from './pages/Home/index.jsx'
import { ProductDetail } from './pages/ProductDetail/index.jsx'
import { NotFound } from './pages/_404.jsx'
import { Header } from './components/Header/index.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext'
import logger from './utils/logger'
import './style.css'

export function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  logger.log('Current path:', currentPath)

  const isProductDetail = currentPath.startsWith('/product/')
  logger.log('Is product detail page:', isProductDetail)

  let productId = null
  if (isProductDetail) {
    const match = currentPath.match(/\/product\/([^/]+)/)
    productId = match ? match[1] : null
    logger.log('Product ID from URL:', productId)
  }

  return (
    <ToastProvider>
      <CartProvider>
        <LocationProvider>
          <div className="app-container">
            <Header />
            <div className="main-content">
              <Router>
                <Route path="/" component={Home} />
                <Route
                  path="/product/:id"
                  component={props => {
                    logger.log('Router props:', props)
                    const id = props.matches?.id || productId
                    logger.log('Using product ID:', id)
                    return <ProductDetail id={id} />
                  }}
                />
                <Route default component={NotFound} />
              </Router>
            </div>
          </div>
        </LocationProvider>
      </CartProvider>
    </ToastProvider>
  )
}

render(<App />, document.getElementById('app'))
