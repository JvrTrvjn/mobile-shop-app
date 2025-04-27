import { useEffect, useState } from 'preact/hooks';
import { useCart } from '../../context/CartContext';
import { getCartCount } from '../../services/productService';
import './style.css';

/**
 * CartCounter component that shows the number of items in the cart
 * @returns {Object} The rendered CartCounter component
 */
/**
 * CartCounter component that shows the number of items in the cart
 * Uses CartContext to maintain consistent state across the app
 * @returns {Object} The CartCounter component
 */
export function CartCounter() {
  // Use the cart context to get the count
  const { state: cartState } = useCart();
  const [count, setCount] = useState(0);
  
  // Update count when cart state changes
  useEffect(() => {
    setCount(cartState.count);
  }, [cartState.count]);
  
  // Also listen for cart updates via event for backward compatibility
  useEffect(() => {
    const handleCartUpdate = () => {
      const updatedCount = getCartCount();
      if (cartState.count !== updatedCount) {
        setCount(updatedCount);
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cartState.count]);
  
  return (
    <div className="cart-counter">
      <div className="cart-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      {count > 0 && (
        <span className="cart-count">{count}</span>
      )}
    </div>
  );
}
