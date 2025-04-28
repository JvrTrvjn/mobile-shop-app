import { createContext } from 'preact'
import { useContext, useReducer, useEffect } from 'preact/hooks'
import { getCartCount, updateCartCount, addProductToCart } from '../services/productService'

const initialState = {
  items: [],
  count: 0,
  total: 0,
}

const CartActionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  INITIALIZE_CART: 'INITIALIZE_CART',
  SYNC_CART_COUNT: 'SYNC_CART_COUNT', // Nuevo tipo de acción para sincronizar con el contador del servidor
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case CartActionTypes.ADD_TO_CART: {
      const { product, quantity = 1, selectedColor, selectedStorage } = action.payload
      const existingItemIndex = state.items.findIndex(
        item =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedStorage === selectedStorage
      )

      let newItems

      if (existingItemIndex !== -1) {
        newItems = [...state.items]
        newItems[existingItemIndex].quantity += quantity
      } else {
        newItems = [
          ...state.items,
          {
            ...product,
            quantity,
            selectedColor,
            selectedStorage,
          },
        ]
      }

      const newCount = state.count + quantity
      const newTotal = state.total + product.price * quantity

      window.dispatchEvent(new CustomEvent('cartUpdated'))

      updateCartCount(newCount)

      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal,
      }
    }

    case CartActionTypes.REMOVE_FROM_CART: {
      const { itemIndex } = action.payload
      const removedItem = state.items[itemIndex]
      const newItems = state.items.filter((_, index) => index !== itemIndex)
      const newCount = state.count - removedItem.quantity
      const newTotal = state.total - removedItem.price * removedItem.quantity

      window.dispatchEvent(new CustomEvent('cartUpdated'))

      // Actualizamos localStorage directamente aquí porque no hay una llamada a la API después
      updateCartCount(newCount)

      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal,
      }
    }

    case CartActionTypes.UPDATE_QUANTITY: {
      const { itemIndex, quantity } = action.payload
      const targetItem = state.items[itemIndex]
      const quantityDiff = quantity - targetItem.quantity

      const newItems = [...state.items]
      newItems[itemIndex].quantity = quantity

      const newCount = state.count + quantityDiff
      const newTotal = state.total + targetItem.price * quantityDiff

      window.dispatchEvent(new CustomEvent('cartUpdated'))

      // Actualizamos localStorage directamente aquí porque no hay una llamada a la API después
      updateCartCount(newCount)

      return {
        ...state,
        items: newItems,
        count: newCount,
        total: newTotal,
      }
    }

    case CartActionTypes.CLEAR_CART: {
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      updateCartCount(0)

      return {
        ...initialState,
      }
    }

    case CartActionTypes.INITIALIZE_CART: {
      return {
        ...state,
        count: action.payload.count,
      }
    }

    case CartActionTypes.SYNC_CART_COUNT: {
      return {
        ...state,
        count: action.payload.count,
      }
    }

    default:
      return state
  }
}

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartState, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    const count = getCartCount()
    dispatch({
      type: CartActionTypes.INITIALIZE_CART,
      payload: { count },
    })
  }, [])

  const cartContextValue = {
    state: cartState,
    addToCart: async (product, quantity, selectedColor, selectedStorage) => {
      try {
        const colorCode = Number(selectedColor)
        const storageCode = Number(selectedStorage)

        if (isNaN(colorCode) || isNaN(storageCode)) {
          throw new Error('Códigos de color o almacenamiento inválidos')
        }

        const cartData = {
          id: product.id,
          colorCode,
          storageCode,
        }

        // Realizamos la adición al carrito localmente primero
        dispatch({
          type: CartActionTypes.ADD_TO_CART,
          payload: { product, quantity, selectedColor, selectedStorage },
        })

        // Luego sincronizamos con la API
        const response = await addProductToCart(cartData)

        // Validamos si la respuesta de la API parece ser correcta
        // Si count es >= a nuestro contador local, lo usamos
        if (response && typeof response.count === 'number' && response.count >= cartState.count) {
          updateCartCount(response.count)

          dispatch({
            type: CartActionTypes.SYNC_CART_COUNT,
            payload: { count: response.count },
          })
        }

        return response
      } catch (error) {
        throw error
      }
    },
    removeFromCart: itemIndex => {
      dispatch({
        type: CartActionTypes.REMOVE_FROM_CART,
        payload: { itemIndex },
      })
    },
    updateQuantity: (itemIndex, quantity) => {
      dispatch({
        type: CartActionTypes.UPDATE_QUANTITY,
        payload: { itemIndex, quantity },
      })
    },
    clearCart: () => {
      dispatch({ type: CartActionTypes.CLEAR_CART })
    },
  }

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>
}

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
