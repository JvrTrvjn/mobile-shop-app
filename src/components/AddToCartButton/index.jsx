import { useState } from 'preact/hooks'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
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
  const { addToCart } = useCart()
  const toast = useToast()

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedStorage) {
      toast.warning('Por favor, selecciona color y almacenamiento')
      return
    }

    setIsAdding(true)

    try {
      await addToCart(product, quantity, selectedColor, selectedStorage)
      toast.success(`¡${product.brand} ${product.model} añadido correctamente!`)
    } catch (error) {
      toast.error(`Error al añadir al carrito: ${error.message}`)
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
