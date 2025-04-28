import { useEffect, useState, useRef, useCallback } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { fromEvent } from 'rxjs'
import { debounceTime, map, filter, distinctUntilChanged } from 'rxjs/operators'
import { fetchProducts } from '../../services/productService'
import { ProductCard } from '../../components/ProductCard/index.jsx'
import './style.css'

export function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState([])
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
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
        console.error('Error al cargar productos:', err)
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

      if (!term.trim()) {
        setFilteredProducts(productsRef.current)
        setShowSuggestions(false)
      } else {
        const filtered = filterProductsByTerm(term)
        setFilteredProducts(filtered)
        setShowSuggestions(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filterProductsByTerm])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function handleSuggestionClick(productId) {
    setShowSuggestions(false)
    location.route(`/product/${productId}`)
  }

  function clearSearch() {
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
      const inputEvent = new Event('input', { bubbles: true })
      searchInputRef.current.dispatchEvent(inputEvent)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleSuggestionClick(filteredProducts[0].id)
    }
  }

  function handleShowAllResults() {
    setShowSuggestions(false)
  }

  return (
    <div className="product-list-page" onClick={() => setShowSuggestions(false)}>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por marca o modelo..."
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
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

          {showSuggestions && searchTerm && (
            <div
              className="search-suggestions"
              ref={suggestionsRef}
              onClick={e => e.stopPropagation()}
            >
              {filteredProducts.slice(0, 5).map(product => (
                <div
                  key={product.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(product.id)}
                >
                  <div className="suggestion-image">
                    <img
                      src={product.imgUrl || 'https://via.placeholder.com/50'}
                      alt={product.model}
                      loading="lazy"
                    />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {product.brand} {product.model}
                    </div>
                  </div>
                  <div className="suggestion-price">
                    {product.price ? `${product.price}€` : 'Consultar precio'}
                  </div>
                </div>
              ))}

              {filteredProducts.length > 5 && (
                <div className="show-all-results" onClick={handleShowAllResults}>
                  Mostrar todos los resultados ({filteredProducts.length})
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="no-suggestions">
                  No se encontraron productos que coincidan con "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && <p className="loading-message">Cargando productos...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (!showSuggestions || !searchTerm) && (
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
