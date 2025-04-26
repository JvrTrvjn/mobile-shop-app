import { useState } from 'preact/hooks';
import './style.css';

/**
 * Selector de color para productos
 * @param {Object} props - Las propiedades del componente
 * @param {Array} props.colors - Lista de colores disponibles
 * @param {Function} props.onColorSelect - Función a ejecutar cuando se selecciona un color
 * @param {string} props.selectedColor - Color actualmente seleccionado
 * @returns {JSX.Element} El componente ColorSelector
 */
export function ColorSelector({ colors, onColorSelect, selectedColor }) {
  if (!colors || colors.length === 0) {
    return null;
  }

  // Determinar si estamos usando la estructura { code, name } o solo string
  const isObjectFormat = typeof colors[0] === 'object' && colors[0] !== null;

  return (
    <div className="color-selector">
      <h4 className="selector-title">Color:</h4>
      <div className="color-options">
        {colors.map(color => {
          // Extraer código y nombre según el formato
          const colorCode = isObjectFormat ? color.code.toString() : color;
          const colorName = isObjectFormat ? color.name : color;
          
          return (
            <div 
              key={colorCode} 
              className={`color-option ${selectedColor === colorCode ? 'selected' : ''}`}
              onClick={() => onColorSelect(colorCode)}
              title={colorName}
            >
              <div 
                className="color-swatch" 
                style={{ backgroundColor: colorName.toLowerCase() }}
              ></div>
              <span className="color-name">{colorName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}