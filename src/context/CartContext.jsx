import { createContext } from 'preact'
import { useContext, useReducer, useEffect } from 'preact/hooks'
import { getCartCount, updateCartCount, addProductToCart } from '../services/productService'
import logger from '../utils/logger'

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
  SYNC_CART_COUNT: 'SYNC_CART_COUNT',
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
      const serverCount = action.payload.count

      let currentLocalCount
      try {
        const storedCount = localStorage.getItem('cartCount')
        currentLocalCount = storedCount ? parseInt(storedCount, 10) : 0
      } catch (e) {
        currentLocalCount = state.count
        logger.error('Error al leer cartCount de localStorage:', e)
      }

      const finalCount = Math.max(serverCount, currentLocalCount)

      updateCartCount(finalCount)

      return {
        ...state,
        count: finalCount,
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

    logger.log('Inicializando carrito con contador:', count)
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

        const countBeforeAdd = cartState.count
        logger.log('Contador antes de añadir:', countBeforeAdd)

        dispatch({
          type: CartActionTypes.ADD_TO_CART,
          payload: { product, quantity, selectedColor, selectedStorage },
        })

        const addedQuantity = quantity
        logger.log('Cantidad añadida:', addedQuantity)

        const response = await addProductToCart(cartData)
        logger.log('Respuesta de API al añadir al carrito:', response)

        if (response && typeof response.count === 'number') {
          const expectedMinCount = countBeforeAdd + addedQuantity

          const finalCount = Math.max(response.count, expectedMinCount)
          logger.log('Contador final después de sincronizar:', finalCount)

          updateCartCount(finalCount)

          dispatch({
            type: CartActionTypes.SYNC_CART_COUNT,
            payload: { count: finalCount },
          })
        }

        return response
      } catch (error) {
        logger.error('Error detallado en addToCart:', error)
        throw new Error('No se pudo añadir el producto al carrito. Inténtalo de nuevo.')
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

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
