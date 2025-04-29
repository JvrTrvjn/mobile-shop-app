import { useState } from 'preact/hooks'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/I18nContext'
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
  const { t } = useTranslation()

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedStorage) {
      toast.warning(t('cart.selectOptions'), {
        toastId: 'selection-warning',
      })
      return
    }

    setIsAdding(true)

    try {
      await addToCart(product, quantity, selectedColor, selectedStorage)
      toast.success(`${product.brand} ${product.model} añadido correctamente!`, {
        toastId: `add-success-${product.id}-${selectedColor}-${selectedStorage}`,
      })
    } catch (error) {
      toast.error(t('cart.error'), {
        toastId: `add-error-${product.id}`,
      })
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
        data-testid="add-to-cart-button"
      >
        {isAdding ? t('productDetail.adding') : t('productDetail.add')}
      </button>

      {(!selectedColor || !selectedStorage) && (
        <div className="selection-reminder">
          {!selectedColor && !selectedStorage
            ? t('cart.selectOptions')
            : !selectedColor
              ? t('cart.selectColor')
              : t('cart.selectStorage')}
        </div>
      )}
    </div>
  )
}
