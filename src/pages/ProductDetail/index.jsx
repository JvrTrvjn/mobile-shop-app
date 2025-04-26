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
 * @returns {JSX.Element} Componente ProductDetail
 */
export function ProductDetail({ id: propId }) {
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  
  // Función para navegar programáticamente
  const navigateToHome = () => {
    location.route('/');
  };
  
  // Obtener el ID del producto desde las props o la URL
  const extractIdFromUrl = () => {
    const pathname = typeof location.url === 'string'
      ? location.url
      : window.location.pathname;
      
    const match = pathname.match(/\/product\/([^/]+)/);
    return match ? match[1] : null;
  };
  
  // Obtener el ID del producto de manera más robusta
  const productId = propId || extractIdFromUrl();
  
  console.log('Product ID being used:', productId);

  // Cargar los detalles del producto cuando el componente se monta o cambia el ID
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
        
        // Manejo defensivo de colores - con log detallado para depuración
        if (productData.colors) {
          console.log('Colors data structure:', JSON.stringify(productData.colors));
          if (productData.colors.length > 0) {
            const firstColor = productData.colors[0];
            console.log('First color type:', typeof firstColor);
            
            // Si firstColor es un objeto con propiedad code
            if (typeof firstColor === 'object' && firstColor !== null && firstColor.code !== undefined) {
              console.log('Setting color from object with code:', firstColor.code);
              setSelectedColor(String(firstColor.code));
            } 
            // Si firstColor es un string o un número directamente
            else if (typeof firstColor === 'string' || typeof firstColor === 'number') {
              console.log('Setting color directly from primitive value:', firstColor);
              setSelectedColor(String(firstColor));
            }
          }
        }
        
        // Manejo defensivo de almacenamiento - con log detallado para depuración
        if (productData.storages) {
          console.log('Storages data structure:', JSON.stringify(productData.storages));
          if (productData.storages.length > 0) {
            const firstStorage = productData.storages[0];
            console.log('First storage type:', typeof firstStorage);
            
            // Si firstStorage es un objeto con propiedad code
            if (typeof firstStorage === 'object' && firstStorage !== null && firstStorage.code !== undefined) {
              console.log('Setting storage from object with code:', firstStorage.code);
              setSelectedStorage(String(firstStorage.code));
            } 
            // Si firstStorage es un string o un número directamente
            else if (typeof firstStorage === 'string' || typeof firstStorage === 'number') {
              console.log('Setting storage directly from primitive value:', firstStorage);
              setSelectedStorage(String(firstStorage));
            }
          }
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

  // Manejadores para selección de color y almacenamiento
  const handleColorSelect = (colorCode) => {
    console.log('Color selected:', colorCode);
    setSelectedColor(colorCode);
  };
  
  const handleStorageSelect = (storageCode) => {
    console.log('Storage selected:', storageCode);
    setSelectedStorage(storageCode);
  };

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="product-detail-container loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando detalles del producto...</p>
      </div>
    );
  }

  // Renderizar pantalla de error
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

  // Si no hay producto, no renderizar nada
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

  // El pathname actual para usar en breadcrumbs o cualquier otra navegación
  const currentPathname = typeof location.url === 'string' 
    ? location.url 
    : window.location.pathname;

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        {/* Primera columna - Imagen del producto */}
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
        
        {/* Segunda columna - Detalles y acciones del producto */}
        <div className="product-info-column">
          {/* Descripción del producto */}
          <div className="product-header">
            <h1 className="product-title">{product.brand} {product.model}</h1>
            <div className="product-price">
              {product.price ? `${product.price}€` : 'Precio no disponible'}
            </div>
          </div>
          
          {/* Especificaciones del producto */}
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
                <span className="spec-value">{product.weight || 'No especificado'}</span>
              </div>
            </div>
          </div>
          
          {/* Acciones del producto - Selectores y botón */}
          <div className="product-actions">
            <h2 className="actions-title">Selecciona las opciones</h2>
            
            {/* Selector de colores */}
            <div className="option-selector">
              <h3 className="selector-label">Color:</h3>
              {product.colors && product.colors.length > 0 ? (
                <ColorSelector 
                  colors={product.colors} 
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                />
              ) : (
                <div className="no-options">No hay opciones de color disponibles</div>
              )}
            </div>
            
            {/* Selector de almacenamiento */}
            <div className="option-selector">
              <h3 className="selector-label">Almacenamiento:</h3>
              {product.storages && product.storages.length > 0 ? (
                <StorageSelector 
                  options={product.storages} 
                  selectedStorage={selectedStorage}
                  onStorageSelect={handleStorageSelect}
                />
              ) : (
                <div className="no-options">No hay opciones de almacenamiento disponibles</div>
              )}
            </div>
            
            {/* Botón de añadir al carrito */}
            <AddToCartButton 
              product={product}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
            />
          </div>
        </div>
      </div>
      
      {/* Botón de volver a la tienda */}
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