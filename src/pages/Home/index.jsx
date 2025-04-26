import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import { fetchProducts } from '../../services/productService';
import { ProductCard } from '../../components/ProductCard/index.jsx';
import './style.css';

export function Home() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      product.brand.toLowerCase().includes(searchTermLower) ||
      product.model.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="product-list-page">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Buscar por marca o modelo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {loading && <p className="loading-message">Cargando productos...</p>}
      
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && (
        <>
          <div className="results-count">
            Mostrando {filteredProducts.length} productos
          </div>
          
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div className="product-card-wrapper" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="no-results">No se encontraron productos que coincidan con "{searchTerm}"</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
