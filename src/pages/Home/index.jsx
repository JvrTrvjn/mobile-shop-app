import { useLocation } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { fetchProducts } from '../../services/productService'

export function Home() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Función para navegar programáticamente
  const navigate = (path) => {
    location.route(path)
  }
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  return (
    <div className="product-list-page">
      <h1>Mobile Shop</h1>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Buscar por marca o modelo..." 
        />
      </div>
      
      {loading && <p>Cargando productos...</p>}
      
      {error && <p>{error}</p>}
      
      {!loading && !error && (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-item">
              <div className="product-image">
                {product.imgUrl ? (
                  <img 
                    src={product.imgUrl} 
                    alt={`${product.brand} ${product.model}`} 
                    style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ width: '150px', height: '150px', background: '#f0f0f0', margin: '0 auto' }}></div>
                )}
              </div>
              <h3>{product.brand}</h3>
              <p>{product.model}</p>
              <p className="price">{product.price ? `${product.price}€` : 'Precio no disponible'}</p>
              <button 
                onClick={() => navigate(`/product/${product.id}`)}
                style={{
                  display: 'inline-block',
                  background: '#4a90e2',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  marginTop: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
