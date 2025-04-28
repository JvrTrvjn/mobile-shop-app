import { useLocation } from 'preact-iso';
import './style.css';

/**
 * Componente de migas de pan para rutas de navegación
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Array de elementos de migas de pan
 * @returns {Object} El componente Breadcrumb
 */
export function Breadcrumb({ items = [] }) {
  const location = useLocation();
  
  const navigate = (path) => {
    if (path) {
      location.route(path);
    }
  };
  
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          
          {item.path && index !== items.length - 1 ? (
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </span>
          ) : (
            <span className="breadcrumb-text">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
