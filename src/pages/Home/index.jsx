export function Home() {
  // Aquí posteriormente añadiremos la lógica para cargar los productos
  const dummyProducts = [
    { id: 1, brand: 'Apple', model: 'iPhone 14', price: '999€', image: 'https://placeholder.com/150' },
    { id: 2, brand: 'Samsung', model: 'Galaxy S22', price: '899€', image: 'https://placeholder.com/150' },
    { id: 3, brand: 'Xiaomi', model: 'Mi 12', price: '799€', image: 'https://placeholder.com/150' },
  ]

  return (
    <div className="product-list-page">
      <h1>Mobile Shop</h1>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Buscar por marca o modelo..." 
        />
      </div>
      
      <div className="product-grid">
        {dummyProducts.map(product => (
          <div key={product.id} className="product-item">
            <div className="product-image">
              {/* Placeholder para la imagen */}
              <div style={{ width: '150px', height: '150px', background: '#f0f0f0', margin: '0 auto' }}></div>
            </div>
            <h3>{product.brand}</h3>
            <p>{product.model}</p>
            <p className="price">{product.price}</p>
            <a href={`/product/${product.id}`}>Ver detalles</a>
          </div>
        ))}
      </div>
    </div>
  )
}
