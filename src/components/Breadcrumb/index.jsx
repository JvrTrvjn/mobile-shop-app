import { useLocation } from 'preact-iso';
import './style.css';

/**
 * Breadcrumb component for navigation paths
 * @param {Object} props - Component props 
 * @param {Array} props.items - Array of breadcrumb items
 * @returns {Object} The Breadcrumb component
 */
export function Breadcrumb({ items = [] }) {
  const location = useLocation();
  
  // Function to handle navigation
  const navigate = (path) => {
    if (path) {
      location.route(path);
    }
  };
  
  // If no items provided, return null
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
