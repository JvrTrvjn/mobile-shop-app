import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'
import { Home } from './pages/Home/index.jsx'
import { ProductDetail } from './pages/ProductDetail/index.jsx'
import { NotFound } from './pages/_404.jsx'
import { Header } from './components/Header/index.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './style.css'

export function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  console.log('Current path:', currentPath)

  const isProductDetail = currentPath.startsWith('/product/')
  console.log('Is product detail page:', isProductDetail)

  let productId = null
  if (isProductDetail) {
    const match = currentPath.match(/\/product\/([^/]+)/)
    productId = match ? match[1] : null
    console.log('Product ID from URL:', productId)
  }

  return (
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
                  console.log('Router props:', props)
                  const id = props.matches?.id || productId
                  console.log('Using product ID:', id)
                  return <ProductDetail id={id} />
                }}
              />
              <Route default component={NotFound} />
            </Router>
          </div>
        </div>
      </LocationProvider>
    </CartProvider>
  )
}

render(<App />, document.getElementById('app'))
