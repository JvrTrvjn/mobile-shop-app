import { useEffect, useState, useRef, useCallback } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { fromEvent } from 'rxjs'
import { debounceTime, map, filter, distinctUntilChanged } from 'rxjs/operators'
import { fetchProducts } from '../../services/productService'
import { ProductCard } from '../../components/ProductCard/index.jsx'
import { useTranslation } from '../../context/I18nContext'
import { MagnifyingGlass, SmileySad } from 'phosphor-react'
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
  const { t } = useTranslation()

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
        setError(t('errors.loadProducts'))
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [t])

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

  return (
    <div className="product-list-page">
      <div className="search-container">
        <div className="search-input-wrapper">
          <MagnifyingGlass className="search-icon" size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('home.search')}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={clearSearch}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {loading && <p className="loading-message">{t('home.loadingProducts')}</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div className="product-card-wrapper" key={product.id} data-testid="product-card">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="no-results-container">
                <SmileySad size={64} weight="fill" className="no-results-icon" />
                <p className="no-results">{t('home.noResults', { term: searchTerm })}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
