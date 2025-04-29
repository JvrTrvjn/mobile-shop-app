import { useLocation } from 'preact-iso'
import { useTranslation } from '../../context/I18nContext'
import './style.css'

/**
 * El componente ProductCard que muestra la informacion del producto en la lista
 * @param {Object} props - Props del componente
 * @param {Object} props.product - Datos del objeto Product
 * @returns {Object} El componente ProductCard
 */
export function ProductCard({ product }) {
  const location = useLocation()
  const { t } = useTranslation()

  if (!product) {
    return null
  }

  const { id, brand, model, price, imgUrl } = product

  const navigateToDetail = () => {
    location.route(`/product/${id}`)
  }

  return (
    <div className="product-card" onClick={navigateToDetail} data-testid="product-card">
      <div className="product-image">
        {imgUrl ? (
          <img src={imgUrl} alt={`${brand} ${model}`} loading="lazy" />
        ) : (
          <div className="product-image-placeholder" />
        )}
      </div>

      <div className="product-info">
        <h3 className="product-brand">{brand}</h3>
        <p className="product-model">{model}</p>
        <p className="product-price">{price ? `${price}€` : t('productDetail.unavailablePrice')}</p>

        <button
          className="product-detail-button"
          onClick={e => {
            e.stopPropagation()
            navigateToDetail()
          }}
        >
          {t('productDetail.addToCart')}
        </button>
      </div>
    </div>
  )
}
