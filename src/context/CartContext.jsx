import { createContext } from 'preact';
import { useContext, useReducer, useEffect } from 'preact/hooks';
import { getCartCount, updateCartCount, addProductToCart } from '../services/productService';

// Initial state for the cart
const initialState = {
  items: [],
  count: 0,
  total: 0
};

// Action types
const CartActionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  INITIALIZE_CART: 'INITIALIZE_CART'
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CartActionTypes.ADD_TO_CART: {
      const { product, quantity = 1, selectedColor, selectedStorage } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id && 
               item.selectedColor === selectedColor && 
               item.selectedStorage === selectedStorage
      );
      
      let newItems;
      
      if (existingItemIndex !== -1) {
        // Product exists, update quantity
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        // New product
        newItems = [
          ...state.items,
          {
            ...product,
            quantity,
            selectedColor,
            selectedStorage
          }
        ];
      }
      
      const newCount = state.count + quantity;
      const newTotal = state.total + (product.price * quantity);
      
      // Trigger cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Update local storage
      updateCartCount(newCount);
      
      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal
      };
    }
    
    case CartActionTypes.REMOVE_FROM_CART: {
      const { itemIndex } = action.payload;
      const removedItem = state.items[itemIndex];
      const newItems = state.items.filter((_, index) => index !== itemIndex);
      const newCount = state.count - removedItem.quantity;
      const newTotal = state.total - (removedItem.price * removedItem.quantity);
      
      // Trigger cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Update local storage
      updateCartCount(newCount);
      
      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal
      };
    }
    
    case CartActionTypes.UPDATE_QUANTITY: {
      const { itemIndex, quantity } = action.payload;
      const targetItem = state.items[itemIndex];
      const quantityDiff = quantity - targetItem.quantity;
      
      const newItems = [...state.items];
      newItems[itemIndex].quantity = quantity;
      
      const newCount = state.count + quantityDiff;
      const newTotal = state.total + (targetItem.price * quantityDiff);
      
      // Trigger cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Update local storage
      updateCartCount(newCount);
      
      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal
      };
    }
    
    case CartActionTypes.CLEAR_CART: {
      // Trigger cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Update local storage
      updateCartCount(0);
      
      return {
        ...initialState
      };
    }
    
    case CartActionTypes.INITIALIZE_CART: {
      return {
        ...state,
        count: action.payload.count
      };
    }
    
    default:
      return state;
  }
};

// Create context
export const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  
  // Initialize cart on component mount
  useEffect(() => {
    const count = getCartCount();
    dispatch({
      type: CartActionTypes.INITIALIZE_CART,
      payload: { count }
    });
  }, []);
  
  // Cart context value
  const cartContextValue = {
    state: cartState,
    addToCart: async (product, quantity, selectedColor, selectedStorage) => {
      try {
        // Preparar los datos para enviar a la API
        const cartData = {
          id: product.id,
          colorCode: parseInt(selectedColor, 10),
          storageCode: parseInt(selectedStorage, 10)
        };
        
        // Enviar datos a la API
        const response = await addProductToCart(cartData);
        console.log('API Response:', response);
        
        // Actualizar el contador con el valor devuelto por la API
        if (response && typeof response.count === 'number') {
          updateCartCount(response.count);
        }
        
        // Actualizar el estado del carrito
        dispatch({
          type: CartActionTypes.ADD_TO_CART,
          payload: { product, quantity, selectedColor, selectedStorage }
        });
      } catch (error) {
        console.error('Error adding product to cart:', error);
      }
    },
    removeFromCart: (itemIndex) => {
      dispatch({
        type: CartActionTypes.REMOVE_FROM_CART,
        payload: { itemIndex }
      });
    },
    updateQuantity: (itemIndex, quantity) => {
      dispatch({
        type: CartActionTypes.UPDATE_QUANTITY,
        payload: { itemIndex, quantity }
      });
    },
    clearCart: () => {
      dispatch({ type: CartActionTypes.CLEAR_CART });
    }
  };
  
  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};