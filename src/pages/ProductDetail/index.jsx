import { useLocation } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { fetchProductDetails } from '../../services/productService'

export function ProductDetail() {
  const location = useLocation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Función para navegar programáticamente
  const navigate = (path) => {
    location.route(path)
  }
  
  // Extraer el ID directamente de la URL pathname utilizando expresiones regulares
  const pathname = typeof location.url === 'string' 
    ? location.url 
    : window.location.pathname
    
  // Usar regex para extraer el ID de una URL como /product/123
  const match = pathname.match(/\/product\/(\d+)/)
  const productId = match ? match[1] : 'no-id'

  useEffect(() => {
    const loadProductDetails = async () => {
      if (productId === 'no-id') {
        setError('ID de producto no válido')
        setLoading(false)
        return
      }
      
      try {
        const productData = await fetchProductDetails(productId)
        setProduct(productData)
      } catch (err) {
        console.error('Error loading product details:', err)
        setError('Error al cargar los detalles del producto')
      } finally {
        setLoading(false)
      }
    }
    
    loadProductDetails()
  }, [productId])

  if (loading) {
    return (
      <div>
        <p>Cargando detalles del producto...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: '#4a90e2',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Volver a la tienda
        </button>
      </div>
    )
  }

  return (
    <div>
      {product && (
        <div>
          <h1>{product.brand} {product.model}</h1>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              {product.imgUrl ? (
                <img 
                  src={product.imgUrl} 
                  alt={`${product.brand} ${product.model}`} 
                  style={{ maxWidth: '300px', maxHeight: '300px' }}
                />
              ) : (
                <div style={{ width: '300px', height: '300px', background: '#f0f0f0' }}></div>
              )}
            </div>
            
            <div>
              <p><strong>Precio:</strong> {product.price ? `${product.price}€` : 'No disponible'}</p>
              <p><strong>CPU:</strong> {product.cpu || 'No especificado'}</p>
              <p><strong>RAM:</strong> {product.ram || 'No especificado'}</p>
              <p><strong>Sistema Operativo:</strong> {product.os || 'No especificado'}</p>
              <p><strong>Resolución de pantalla:</strong> {product.displaySize || 'No especificado'}</p>
              <p><strong>Batería:</strong> {product.battery || 'No especificado'}</p>
              <p><strong>Cámaras:</strong> {product.primaryCamera || 'No especificado'}</p>
              <p><strong>Dimensiones:</strong> {product.dimentions || 'No especificado'}</p>
              <p><strong>Peso:</strong> {product.weight || 'No especificado'}</p>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: '#4a90e2',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}