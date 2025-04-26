import { useLocation } from 'preact-iso';
import './style.css';

/**
 * ProductCard component for displaying product information in the list view
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data object
 * @returns {JSX.Element} The ProductCard component
 */
export function ProductCard({ product }) {
  const location = useLocation();
  
  if (!product) {
    return null;
  }
  
  const { id, brand, model, price, imgUrl } = product;
  
  // Function to navigate to product detail
  const navigateToDetail = () => {
    console.log('Navigating to product with ID:', id);
    location.route(`/product/${id}`);
  };
  
  return (
    <div className="product-card" onClick={navigateToDetail}>
      <div className="product-image">
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt={`${brand} ${model}`} 
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder"></div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-brand">{brand}</h3>
        <p className="product-model">{model}</p>
        <p className="product-price">
          {price ? `${price}€` : 'Precio no disponible'}
        </p>
        
        <button 
          className="product-detail-button"
          onClick={(e) => {
            e.stopPropagation();
            navigateToDetail();
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}
