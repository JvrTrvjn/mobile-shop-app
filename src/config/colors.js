/**
 * Mapa de códigos de colores a sus valores CSS.
 * Se utiliza para representación visual de los colores.
 *
 * @type {Object.<number, string>}
 */
export const COLOR_MAP = {
  1000: 'black',
  1001: 'white',
  1002: 'red',
  1003: 'blue',
  1004: 'green',
  1005: 'yellow',
  1006: 'purple',
  1007: 'gray',
  1008: 'silver',
  1009: 'gold',
}

const COLOR_NAMES = {
  black: 'black',
  white: 'white',
  red: 'red',
  blue: 'blue',
  green: 'green',
  yellow: 'yellow',
  purple: 'purple',
  gray: 'gray',
  silver: 'silver',
  gold: 'gold',
  'pure white': 'white',
}

/**
 * Obtiene el valor CSS para un código o nombre de color
 * @param {number|string} colorCode - El código del color
 * @param {string} [colorName] - El nombre del color (opcional)
 * @param {string} [defaultColor='#cccccc'] - Color por defecto si no se encuentra
 * @returns {string} El valor CSS del color
 */
export function getColorByCode(colorCode, colorName, defaultColor = '#cccccc') {
  if (colorCode && COLOR_MAP[colorCode]) {
    return COLOR_MAP[colorCode]
  }

  if (colorName) {
    const normalizedName = colorName.toLowerCase()
    if (COLOR_NAMES[normalizedName]) {
      return COLOR_NAMES[normalizedName]
    }
  }

  return defaultColor
}
