import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import { CartCounter } from '../CartCounter';
import './style.css';

/**
 * Header component that displays the app title, breadcrumbs, and cart count
 * @returns {Object} The Header component
 */
export function Header() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('/');
  
  // Update path when location changes
  useEffect(() => {
    const pathname = typeof location.url === 'string' 
      ? location.url 
      : window.location.pathname;
      
    setCurrentPath(pathname);
  }, [location]);
  
  // Function to navigate to home
  const navigateToHome = () => {
    location.route('/');
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container" onClick={navigateToHome}>
          <h1 className="app-title">Mobile Shop</h1>
        </div>
        
        <div className="breadcrumb-container">
          {/* We'll use the Breadcrumb component here */}
          {currentPath !== '/' && (
            <div className="breadcrumb">
              <span className="breadcrumb-home" onClick={navigateToHome}>Home</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {currentPath.includes('/product/') ? 'Product Details' : 'Not Found'}
              </span>
            </div>
          )}
        </div>
        
        <div className="cart-container">
          <CartCounter />
        </div>
      </div>
    </header>
  );
}
