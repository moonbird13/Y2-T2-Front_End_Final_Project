import { useState } from 'react'

function FavouriteTab({ favorites, onRemoveFavorite, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'hotel', 'restaurant', 'attraction']

  const filteredFavorites = selectedCategory === 'all'
    ? favorites
    : favorites.filter(item => item.category === selectedCategory)

  const groupedFavorites = filteredFavorites.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="recommended-page">
      <button type="button" className="recommended-page__close" onClick={onClose} aria-label="Exit favorites">
        ✕
      </button>

      <div className="recommended-page__container">
        <h1>FAVOURITE TAB</h1>
        <p className="recommended-page__subtitle">YOUR SAVED ITEMS</p>

        {/* Category Filter */}
        <div className="favorite-filter">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={`favorite-filter__button ${selectedCategory === category ? 'favorite-filter__button--active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1) + 's'}
            </button>
          ))}
        </div>

        {Object.keys(groupedFavorites).length === 0 ? (
          <div className="favorites-empty">
            <p>No favorites yet. Start exploring and save your favorite places!</p>
          </div>
        ) : (
          Object.entries(groupedFavorites).map(([category, items]) => (
            <section key={category} className="recommended-row">
              <h2>{category.toUpperCase()}S</h2>
              <div className="recommended-cards-row">
                {items.map((item) => (
                  <article key={`${item.category}-${item.id}`} className="recommendation-card">
                    <div className="recommendation-card__image-container">
                      <img src={item.image} alt={item.name} className="recommendation-card__image" />
                      <button
                        type="button"
                        className="favorite-star favorite-star--active"
                        onClick={() => onRemoveFavorite(item)}
                        aria-label={`Remove ${item.name} from favorites`}
                      >
                        ★
                      </button>
                    </div>

                    <div className="recommendation-card__content">
                      <div className="recommendation-card__title-row">
                        <h3>{item.name}</h3>
                        <p className="recommendation-card__price">{item.priceRange?.label || '$50-150'}</p>
                      </div>

                      <div className="recommendation-card__meta">
                        <p>Rating: {item.rating ? Number(item.rating).toFixed(1) : '4.5'} / 5</p>
                        <p>Direction: {item.direction || 'City Center'}</p>
                        {item.phone && <p>Phone: {item.phone}</p>}
                        {item.telegram && <p>Telegram: {item.telegram}</p>}
                      </div>

                      <button type="button" className="recommendation-card__button">
                        View More
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

export default FavouriteTab