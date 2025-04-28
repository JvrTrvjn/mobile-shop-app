import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import { fetchProductDetails } from '../../services/productService';
import { ColorSelector } from '../../components/ColorSelector/index.jsx';
import { StorageSelector } from '../../components/StorageSelector/index.jsx';
import { AddToCartButton } from '../../components/AddToCartButton/index.jsx';
import './style.css';

/**
 * Componente de detalle de producto (PDP - Product Details Page)
 * Muestra la información detallada de un producto y permite añadirlo al carrito
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID del producto a mostrar (opcional, también puede extraerse de la URL)
 * @returns {Object} Componente ProductDetail
 */
export function ProductDetail({ id: propId }) {
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  
  const navigateToHome = () => {
    location.route('/');
  };
  
  const extractIdFromUrl = () => {
    const pathname = typeof location.url === 'string'
      ? location.url
      : window.location.pathname;
      
    const match = pathname.match(/\/product\/([^/]+)/);
    return match ? match[1] : null;
  };
  
  const productId = propId || extractIdFromUrl();
  
  console.log('Product ID being used:', productId);

  useEffect(() => {
    const loadProductDetails = async () => {
      if (!productId) {
        setError('ID de producto no válido');
        setLoading(false);
        return;
      }
      
      try {
        const productData = await fetchProductDetails(productId);
        console.log('Product data received:', productData);
        
        if (!productData) {
          throw new Error('No se recibieron datos del producto');
        }
        
        setProduct(productData);
        
        if (productData.options && productData.options.colors && productData.options.colors.length > 0) {
          console.log('Setting default color from options.colors array:', productData.options.colors[0]);
          setSelectedColor(String(productData.options.colors[0].code));
        }
        
        if (productData.options && productData.options.storages && productData.options.storages.length > 0) {
          console.log('Setting default storage from options.storages array:', productData.options.storages[0]);
          setSelectedStorage(String(productData.options.storages[0].code));
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        setError(`Error al cargar los detalles del producto: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadProductDetails();
  }, [productId]);

  const handleColorSelect = (colorCode) => {
    console.log('Color selected:', colorCode);
    setSelectedColor(colorCode);
  };
  
  const handleStorageSelect = (storageCode) => {
    console.log('Storage selected:', storageCode);
    setSelectedStorage(storageCode);
  };

  if (loading) {
    return (
      <div className="product-detail-container loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container error">
        <div className="error-icon">!</div>
        <p className="error-message">{error}</p>
        <button 
          onClick={navigateToHome}
          className="back-button"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container error">
        <div className="error-icon">!</div>
        <p className="error-message">No se encontró información del producto</p>
        <button 
          onClick={navigateToHome}
          className="back-button"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  const currentPathname = typeof location.url === 'string' 
    ? location.url 
    : window.location.pathname;

  const colorOptions = product.options?.colors || [];
  const storageOptions = product.options?.storages || [];

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-image-column">
          <div className="product-image-container">
            {product.imgUrl ? (
              <img 
                src={product.imgUrl} 
                alt={`${product.brand} ${product.model}`} 
                className="product-image"
              />
            ) : (
              <div className="product-image-placeholder">
                <span>Imagen no disponible</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="product-info-column">
          <div className="product-header">
            <h1 className="product-title">{product.brand} {product.model}</h1>
            <div className="product-price">
              {product.price ? `${product.price}€` : 'Precio no disponible'}
            </div>
          </div>
          
          <div className="product-specs">
            <h2 className="specs-title">Especificaciones</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">CPU:</span>
                <span className="spec-value">{product.cpu || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">RAM:</span>
                <span className="spec-value">{product.ram || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Sistema Operativo:</span>
                <span className="spec-value">{product.os || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Resolución:</span>
                <span className="spec-value">{product.displaySize || product.display?.size || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Batería:</span>
                <span className="spec-value">{product.battery || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Cámaras:</span>
                <span className="spec-value">
                  {Array.isArray(product.primaryCamera) 
                    ? product.primaryCamera.join(', ') 
                    : (product.primaryCamera || 'No especificado')}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dimensiones:</span>
                <span className="spec-value">{product.dimentions || product.dimensions || 'No especificado'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Peso:</span>
                <span className="spec-value">{product.weight ? `${product.weight} g` : 'No especificado'}</span>
              </div>
            </div>
          </div>
          
          <div className="product-actions">
            <h2 className="actions-title">Selecciona las opciones</h2>
            
            <div className="option-selector">
              <h3 className="selector-label">Color:</h3>
              {colorOptions.length > 0 ? (
                <ColorSelector 
                  colors={colorOptions} 
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                />
              ) : (
                <div className="no-options">No hay opciones de color disponibles</div>
              )}
            </div>
            
            <div className="option-selector">
              <h3 className="selector-label">Almacenamiento:</h3>
              {storageOptions.length > 0 ? (
                <StorageSelector 
                  options={storageOptions} 
                  selectedStorage={selectedStorage}
                  onStorageSelect={handleStorageSelect}
                />
              ) : (
                <div className="no-options">No hay opciones de almacenamiento disponibles</div>
              )}
            </div>
            
            <AddToCartButton 
              product={product}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
            />
          </div>
        </div>
      </div>
      
      <div className="back-to-store">
        <button 
          onClick={navigateToHome}
          className="back-button"
        >
          ← Volver a la tienda
        </button>
      </div>
    </div>
  );
}