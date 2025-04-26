import { useState } from 'preact/hooks';
import { useCart } from '../../context/CartContext';
import './style.css';

/**
 * Botón para añadir productos al carrito
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Producto a añadir al carrito
 * @param {string} props.selectedColor - Color seleccionado del producto
 * @param {string} props.selectedStorage - Almacenamiento seleccionado del producto
 * @returns {JSX.Element} Componente AddToCartButton
 */
export function AddToCartButton({ product, selectedColor, selectedStorage }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedStorage) {
      return; // No continuar si faltan selecciones
    }
    
    setIsAdding(true);
    
    try {
      // Llamar a la función addToCart del contexto que ya maneja la comunicación con la API
      await addToCart(product, quantity, selectedColor, selectedStorage);
      
      // Mostrar un mensaje de éxito o feedback (podríamos usar un toast o notificación)
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = (e) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="add-to-cart-container">
      <div className="quantity-selector">
        <button 
          className="quantity-btn" 
          onClick={decrementQuantity}
          disabled={quantity <= 1}
        >
          -
        </button>
        <span className="quantity-value">{quantity}</span>
        <button 
          className="quantity-btn" 
          onClick={incrementQuantity}
        >
          +
        </button>
      </div>
      
      <button 
        className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding || !selectedColor || !selectedStorage}
      >
        {isAdding ? 'Añadiendo...' : 'Añadir al carrito'}
      </button>
    </div>
  );
}