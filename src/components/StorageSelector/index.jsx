import { useState } from 'preact/hooks';
import './style.css';

/**
 * Selector de almacenamiento para productos
 * @param {Object} props - Las propiedades del componente
 * @param {Array} props.options - Lista de opciones de almacenamiento disponibles (objetos con code y name, o valores primitivos)
 * @param {Function} props.onStorageSelect - Función a ejecutar cuando se selecciona una opción
 * @param {string} props.selectedStorage - Código o valor del almacenamiento actualmente seleccionado
 * @returns {Object} El componente StorageSelector
 */
export function StorageSelector({ options, onStorageSelect, selectedStorage }) {
  if (!options || options.length === 0) {
    return null;
  }

  const firstOption = options[0];
  const isObjectFormat = typeof firstOption === 'object' && firstOption !== null;

  const getStorageName = (option) => {
    if (isObjectFormat) {
      return option.name || `${option.code} GB`;
    }
    return `${option} GB`;
  };

  const getStorageValue = (option) => {
    const value = isObjectFormat ? option.code : option;
    return String(value);
  };

  return (
    <div className="storage-selector">
      {options.map(option => {
        const storageValue = getStorageValue(option);
        
        return (
          <div 
            key={storageValue} 
            className={`storage-option ${selectedStorage === storageValue ? 'selected' : ''}`}
            onClick={() => onStorageSelect(storageValue)}
          >
            <span className="storage-value">{getStorageName(option)}</span>
          </div>
        );
      })}
    </div>
  );
}