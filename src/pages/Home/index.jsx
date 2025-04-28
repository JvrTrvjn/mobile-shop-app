import { useEffect, useState, useRef, useCallback } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { fromEvent } from 'rxjs'
import { debounceTime, map, filter, distinctUntilChanged } from 'rxjs/operators'
import { fetchProducts } from '../../services/productService'
import { ProductCard } from '../../components/ProductCard/index.jsx'
import logger from '../../utils/logger'
import './style.css'

export function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const searchInputRef = useRef(null)
  const productsRef = useRef(products)
  const location = useLocation()

  useEffect(() => {
    productsRef.current = products
  }, [products])

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (err) {
        logger.error('Error al cargar productos:', err)
        setError('Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filterProductsByTerm = useCallback(term => {
    if (!term.trim()) return productsRef.current

    const searchLower = term.toLowerCase()
    return productsRef.current.filter(
      product =>
        product.brand?.toLowerCase().includes(searchLower) ||
        product.model?.toLowerCase().includes(searchLower)
    )
  }, [])

  useEffect(() => {
    if (!searchInputRef.current) return

    const inputObservable = fromEvent(searchInputRef.current, 'input').pipe(
      map(e => e.target.value),
      debounceTime(300),
      distinctUntilChanged(),
      filter(() => productsRef.current.length > 0)
    )

    const subscription = inputObservable.subscribe(term => {
      setSearchTerm(term)
      const filtered = filterProductsByTerm(term)
      setFilteredProducts(filtered)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filterProductsByTerm])

  function clearSearch() {
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
      const inputEvent = new Event('input', { bubbles: true })
      searchInputRef.current.dispatchEvent(inputEvent)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      location.route(`/product/${filteredProducts[0].id}`)
    }
  }

  return (
    <div className="product-list-page">
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por marca o modelo..."
            onKeyDown={handleKeyDown}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={e => {
                e.stopPropagation()
                clearSearch()
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {loading && <p className="loading-message">Cargando productos...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="results-count">
            {searchTerm
              ? `Mostrando ${filteredProducts.length} productos para "${searchTerm}"`
              : `Mostrando ${filteredProducts.length} productos`}
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div className="product-card-wrapper" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="no-results">
                No se encontraron productos que coincidan con "{searchTerm}"
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
