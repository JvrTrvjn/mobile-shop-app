import { useState } from 'preact/hooks';
import './style.css';

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
    return null;
  }

  // Función para determinar el color CSS según el código
  const getColorStyle = (colorCode) => {
    // Mapa de códigos comunes a colores CSS
    const colorMap = {
      1: 'black',
      2: 'white',
      3: 'red',
      4: 'blue',
      5: 'green',
      6: 'yellow',
      7: 'purple',
      8: 'gray',
      9: 'silver',
      10: 'gold'
    };
    
    // Intentar usar el mapa o devolver un color por defecto
    return colorMap[colorCode] || '#cccccc';
  };

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
            style={{ backgroundColor: getColorStyle(color.code) }}
          ></div>
          <span className="color-name">{color.name || `Color ${color.code}`}</span>
        </div>
      ))}
    </div>
  );
}