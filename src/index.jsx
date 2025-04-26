import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Home } from './pages/Home/index.jsx';
import { ProductDetail } from './pages/ProductDetail/index.jsx';
import { NotFound } from './pages/_404.jsx';
import './style.css';

export function App() {
  return (
    <LocationProvider>
      <div className="app-container">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route default component={NotFound} />
        </Router>
      </div>
    </LocationProvider>
  );
}

render(<App />, document.getElementById('app'));
