import { useLocation } from 'preact-iso'
import { useTranslation } from '../context/I18nContext'

export function NotFound() {
  const location = useLocation()
  const { t } = useTranslation()

  const navigate = path => {
    location.route(path)
  }

  return (
    <div>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
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
          cursor: 'pointer',
        }}
      >
        {t('notFound.backToHome')}
      </button>
    </div>
  )
}
