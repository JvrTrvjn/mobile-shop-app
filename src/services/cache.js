const CACHE_EXPIRATION = 60 * 60 * 1000

/**
 * Obtiene los datos de la cache
 * @param {string} key - La clave de la cache
 * @returns {any|null} Los datos cacheados si son validos, si no nulos
 */
export const getFromCache = key => {
  try {
    const cachedData = localStorage.getItem(key)

    if (!cachedData) {
      return null
    }

    const parsedData = JSON.parse(cachedData)

    if (Date.now() > parsedData.expiry) {
      localStorage.removeItem(key)
      return null
    }

    return parsedData.data
  } catch (error) {
    return null
  }
}

/**
 * Guarda los datos con tiempo de expiracion
 * @param {string} key - La clave de la cache
 * @param {any} data - Los datos de la cache
 */
export const saveToCache = (key, data) => {
  try {
    const cacheObject = {
      data,
      expiry: Date.now() + CACHE_EXPIRATION,
    }

    localStorage.setItem(key, JSON.stringify(cacheObject))
  } catch (error) {}
}

/**
 * Genera una clave cache para un recurso especifico
 * @param {string} resourceType - Tipo de recurso (e.j., 'productos', 'producto')
 * @param {string|null} id - ID opcional para el recurso
 * @returns {string} Clave de cache
 */
export const getCacheKey = (resourceType, id = null) => {
  // Asegurarse de que el ID sea siempre una cadena y esté correctamente formateado
  const formattedId = id ? String(id).trim() : null;
  return formattedId ? `${resourceType}_${formattedId}` : resourceType;
}

export const clearCache = () => {
  try {
    const keysToRemove = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('products') || key.startsWith('product_')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {}
}
