import { useState } from 'preact/hooks'
import { useCart } from '../../context/CartContext'
import './style.css'

/**
 * Botón para añadir productos al carrito
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Producto a añadir al carrito
 * @param {string} props.selectedColor - Color seleccionado del producto
 * @param {string} props.selectedStorage - Almacenamiento seleccionado del producto
 * @returns {Object} Componente AddToCartButton
 */
export function AddToCartButton({ product, selectedColor, selectedStorage }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [error, setError] = useState(null)
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedStorage) {
      setError('Por favor, selecciona color y almacenamiento')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await addToCart(product, quantity, selectedColor, selectedStorage)

      setAddSuccess(true)

      setTimeout(() => {
        setAddSuccess(false)
      }, 3000)
    } catch (error) {
      setError(`Error al añadir al carrito: ${error.message}`)
    } finally {
      setIsAdding(false)
    }
  }

  const incrementQuantity = e => {
    e.stopPropagation()
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = e => {
    e.stopPropagation()
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <div className="add-to-cart-container">
      {error && <div className="cart-error">{error}</div>}

      {addSuccess && <div className="cart-success">¡Producto añadido correctamente!</div>}

      <div className="quantity-selector">
        <button
          className="quantity-btn"
          onClick={decrementQuantity}
          disabled={quantity <= 1 || isAdding}
        >
          -
        </button>
        <span className="quantity-value">{quantity}</span>
        <button className="quantity-btn" onClick={incrementQuantity} disabled={isAdding}>
          +
        </button>
      </div>

      <button
        className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${!selectedColor || !selectedStorage ? 'disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding || !selectedColor || !selectedStorage}
      >
        {isAdding ? 'Añadiendo...' : 'Añadir al carrito'}
      </button>

      {(!selectedColor || !selectedStorage) && (
        <div className="selection-reminder">
          {!selectedColor && !selectedStorage
            ? 'Selecciona color y almacenamiento'
            : !selectedColor
              ? 'Selecciona un color'
              : 'Selecciona almacenamiento'}
        </div>
      )}
    </div>
  )
}
