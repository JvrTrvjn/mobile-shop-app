import { useLocation } from 'preact-iso'
import { useEffect, useState, useCallback } from 'preact/hooks'
import { fetchProductDetails } from '../../services/productService'
import { clearCache } from '../../services/cache'
import { ColorSelector } from '../../components/ColorSelector/index.jsx'
import { StorageSelector } from '../../components/StorageSelector/index.jsx'
import { AddToCartButton } from '../../components/AddToCartButton/index.jsx'
import { useTranslation } from '../../context/I18nContext'
import { ArrowLeft } from 'phosphor-react'
import './style.css'

/**
 * Componente de detalle de producto (PDP - Product Details Page)
 * Muestra la información detallada de un producto y permite añadirlo al carrito
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID del producto a mostrar (opcional, también puede extraerse de la URL)
 * @returns {Object} Componente ProductDetail
 */
export function ProductDetail({ id: propId }) {
  const location = useLocation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedStorage, setSelectedStorage] = useState('')
  const { t } = useTranslation()

  const navigateToHome = useCallback(() => {
    location.route('/')
  }, [location])

  const extractIdFromUrl = useCallback(() => {
    const pathname = typeof location.url === 'string' ? location.url : window.location.pathname

    const match = pathname.match(/\/product\/([^/]+)/)
    return match ? match[1] : null
  }, [location])

  const productId = propId || extractIdFromUrl()

  console.log('Product ID being used:', productId)

  useEffect(() => {
    const loadProductDetails = async () => {
      if (!productId) {
        setError(t('errors.invalidId'))
        setLoading(false)
        return
      }

      try {
        const productData = await fetchProductDetails(productId)
        console.log('Product data received:', productData)

        if (!productData) {
          throw new Error(t('errors.productNotFound'))
        }

        setProduct(productData)

        if (
          productData.options &&
          productData.options.colors &&
          productData.options.colors.length > 0
        ) {
          console.log(
            'Setting default color from options.colors array:',
            productData.options.colors[0]
          )
          setSelectedColor(String(productData.options.colors[0].code))
        }

        if (
          productData.options &&
          productData.options.storages &&
          productData.options.storages.length > 0
        ) {
          console.log(
            'Setting default storage from options.storages array:',
            productData.options.storages[0]
          )
          setSelectedStorage(String(productData.options.storages[0].code))
        }
      } catch (err) {
        console.error('Error loading product details:', err)
        setError(`${t('product.error')}: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadProductDetails()
  }, [productId, t])

  const handleColorSelect = useCallback(colorCode => {
    console.log('Color selected:', colorCode)
    setSelectedColor(colorCode)
  }, [])

  const handleStorageSelect = useCallback(storageCode => {
    console.log('Storage selected:', storageCode)
    setSelectedStorage(storageCode)
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setLoading(true)

    // Limpiar el caché antes de volver a intentar
    try {
      clearCache()
      console.log('Cache cleared successfully')
    } catch (cacheError) {
      console.error('Error clearing cache:', cacheError)
    }

    const loadProductDetails = async () => {
      try {
        console.log('Retrying to load product ID:', productId)
        const productData = await fetchProductDetails(productId)
        console.log('Retry successful, product data:', productData)
        setProduct(productData)
        if (productData.options?.colors?.length > 0) {
          setSelectedColor(String(productData.options.colors[0].code))
        }
        if (productData.options?.storages?.length > 0) {
          setSelectedStorage(String(productData.options.storages[0].code))
        }
      } catch (err) {
        console.error('Retry failed:', err)
        setError(`${t('product.error')}: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadProductDetails()
  }, [productId, t])

  if (loading) {
    return (
      <div className="product-detail-container loading">
        <div className="loading-spinner" />
        <p className="loading-text">{t('product.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail-container error">
        <div className="error-icon">!</div>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="retry-button">
            {t('product.tryAgain')}
          </button>
          <button
            onClick={() => {
              clearCache()
              window.location.reload()
            }}
            className="clear-cache-button"
          >
            Limpiar caché y recargar
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-container error">
        <div className="error-icon">!</div>
        <p className="error-message">{t('errors.productNotFound')}</p>
        <button onClick={navigateToHome} className="back-button">
          {t('productDetail.goBack')}
        </button>
      </div>
    )
  }

  const colorOptions = product.options?.colors || []
  const storageOptions = product.options?.storages || []

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-detail-content-inner">
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
                  <span>{t('productDetail.noImage')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="product-info-column">
            <div className="product-header">
              <h1 className="product-title">
                {product.brand} {product.model}
              </h1>
              <div className="product-price">
                {product.price ? `${product.price}€` : t('productDetail.unavailablePrice')}
              </div>
            </div>

            <div className="product-specs">
              <h2 className="specs-title">{t('productDetail.specifications')}</h2>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.brand')}:</span>
                  <span className="spec-value">
                    {product.brand || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.cpu')}:</span>
                  <span className="spec-value">
                    {product.cpu || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.ram')}:</span>
                  <span className="spec-value">
                    {product.ram || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.os')}:</span>
                  <span className="spec-value">
                    {product.os || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.display')}:</span>
                  <span className="spec-value">
                    {product.displaySize ||
                      product.display?.size ||
                      t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.battery')}:</span>
                  <span className="spec-value">
                    {product.battery || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.cameras')}:</span>
                  <span className="spec-value">
                    {Array.isArray(product.primaryCamera)
                      ? product.primaryCamera.join(', ')
                      : product.primaryCamera || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.dimensions')}:</span>
                  <span className="spec-value">
                    {product.dimentions || product.dimensions || t('productDetail.notSpecified')}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t('productDetail.weight')}:</span>
                  <span className="spec-value">
                    {product.weight ? `${product.weight} g` : t('productDetail.notSpecified')}
                  </span>
                </div>
              </div>
            </div>

            <div className="product-actions">
              <h2 className="actions-title">{t('productDetail.selectOptions')}</h2>

              <div className="option-selector">
                <h3 className="selector-label">{t('productDetail.colors')}:</h3>
                {colorOptions.length > 0 ? (
                  <ColorSelector
                    colors={colorOptions}
                    selectedColor={selectedColor}
                    onColorSelect={handleColorSelect}
                  />
                ) : (
                  <div className="no-options">{t('productDetail.noColorOptions')}</div>
                )}
              </div>

              <div className="option-selector">
                <h3 className="selector-label">{t('productDetail.storage')}:</h3>
                {storageOptions.length > 0 ? (
                  <StorageSelector
                    storages={storageOptions}
                    options={storageOptions}
                    selectedStorage={selectedStorage}
                    onStorageSelect={handleStorageSelect}
                  />
                ) : (
                  <div className="no-options">{t('productDetail.noStorageOptions')}</div>
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
      </div>
      <div className="back-to-store">
        <button onClick={navigateToHome} className="back-button">
          <ArrowLeft size={20} weight="bold" />
          {t('productDetail.goBack')}
        </button>
      </div>
    </div>
  )
}
