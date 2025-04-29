import './style.css'

/**
 * Selector de color para productos
 * @param {Object} props - Las propiedades del componente
 * @param {Array} props.colors - Lista de colores disponibles (objetos con code y name)
 * @param {Function} props.onColorSelect - Función a ejecutar cuando se selecciona un color
 * @param {string} props.selectedColor - Código del color actualmente seleccionado
 * @returns {Object} El componente ColorSelector
 */
export function ColorSelector({ colors, onColorSelect, selectedColor }) {
  if (!colors || colors.length === 0) {
    return null
  }

  const getColorStyle = (colorCode, colorName) => {
    const colorMap = {
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
      burgundy: 'darkred',
      titan: 'black',
      navy: 'navy',
      rose: 'pink',
      midnight: 'midnightblue',
      sky: 'skyblue',
    }

    if (!colorName) return '#cccccc'

    const lowerCaseName = colorName.toLowerCase()

    if (colorMap[lowerCaseName]) {
      return colorMap[lowerCaseName]
    }

    const words = lowerCaseName.split(' ')
    for (const word of words) {
      if (colorMap[word]) {
        return colorMap[word]
      }
    }

    for (const key of Object.keys(colorMap)) {
      if (lowerCaseName.includes(key)) {
        return colorMap[key]
      }
    }

    return '#cccccc'
  }

  return (
    <div className="color-selector">
      {colors.map(color => (
        <div
          key={color.code}
          className={`color-option ${selectedColor === color.code.toString() ? 'selected' : ''}`}
          onClick={() => onColorSelect(color.code.toString())}
        >
          <div
            className="color-swatch"
            style={{ backgroundColor: getColorStyle(color.code, color.name) }}
          />
          <span className="color-name">{color.name}</span>
        </div>
      ))}
    </div>
  )
}
