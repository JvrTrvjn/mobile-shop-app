import { useLocation } from 'preact-iso'

export function ProductDetail() {
  const location = useLocation()
  
  // Extraer el ID directamente de la URL pathname utilizando expresiones regulares
  const pathname = typeof location.url === 'string' 
    ? location.url 
    : window.location.pathname
    
  // Usar regex para extraer el ID de una URL como /product/123
  const match = pathname.match(/\/product\/(\d+)/)
  const productId = match ? match[1] : 'no-id'

  return (
    <div>
      <h1>Product Detail Page</h1>
      <p>Viewing details for product ID: {productId}</p>
      <a href="/">Back to Products</a>
    </div>
  )
}