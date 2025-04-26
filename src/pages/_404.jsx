import { useLocation } from 'preact-iso'

export function NotFound() {
  const location = useLocation()
  
  // Función para navegar programáticamente
  const navigate = (path) => {
    location.route(path)
  }

  return (
    <div>
      <h1>404: Not Found</h1>
      <p>La página que estás buscando no existe.</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          background: '#4a90e2',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          marginTop: '10px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Volver a la página principal
      </button>
    </div>
  )
}