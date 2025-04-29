import { useEffect, useState } from 'preact/hooks'
import { useCart } from '../../context/CartContext'
import { getCartCount } from '../../services/productService'
import logger from '../../utils/logger'
import './style.css'

/**
 * Componente CartCounter que muestra el número de artículos en el carrito
 * @returns {Object} El componente CartCounter renderizado
 */
export function CartCounter() {
  const { state: cartState } = useCart()
  const [count, setCount] = useState(0)

  // Sincronizamos con el estado del contexto del carrito
  useEffect(() => {
    setCount(cartState.count)
    logger.log('CartCounter sincronizado con contexto:', cartState.count)
  }, [cartState.count])

  // Escuchamos eventos de actualización del carrito para asegurar sincronización
  useEffect(() => {
    const handleCartUpdate = () => {
      const storedCount = getCartCount()
      logger.log('CartCounter: evento cartUpdated detectado, contador:', storedCount)

      if (count !== storedCount) {
        setCount(storedCount)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [count])

  return (
    <div className="cart-counter">
      <div className="cart-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      {count > 0 && <span className="cart-count">{count}</span>}
    </div>
  )
}
