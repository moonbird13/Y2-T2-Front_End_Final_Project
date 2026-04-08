function RecommendedPage({ onClose, answers }) {
  // Generate recommendations based on quiz answers
  const generateRecommendations = (answers) => {
    const budget = answers?.budget || 1000
    const days = answers?.days || 3
    const province = answers?.province || 'Phnom Penh'

    // Sample data - in a real app, this would be more sophisticated
    const recommendations = {
      hotels: [
        { name: 'Luxury Resort & Spa', price: '$300/night', description: '5-star luxury with pool and spa' },
        { name: 'Boutique Hotel', price: '$150/night', description: 'Charming boutique with local art' },
        { name: 'Budget Guesthouse', price: '$50/night', description: 'Clean and comfortable basic accommodation' }
      ],
      restaurants: [
        { name: 'Fine Dining Restaurant', price: '$50/person', description: 'Michelin-starred Cambodian-French fusion' },
        { name: 'Local Street Food', price: '$10/person', description: 'Authentic Khmer street food experience' },
        { name: 'Mid-range Cafe', price: '$25/person', description: 'Casual dining with local specialties' }
      ],
      activities: [
        { name: 'Guided Temple Tour', price: '$40/person', description: 'Full day exploration of ancient temples' },
        { name: 'Cooking Class', price: '$35/person', description: 'Learn to cook traditional Khmer dishes' },
        { name: 'Market Visit & Shopping', price: '$20/person', description: 'Explore local markets and handicrafts' },
        { name: 'Boat Cruise', price: '$30/person', description: 'Scenic river cruise with cultural shows' }
      ],
      transportation: [
        { name: 'Private Car with Driver', price: '$80/day', description: 'Comfortable air-conditioned vehicle' },
        { name: 'Motorbike Rental', price: '$15/day', description: 'Freedom to explore at your own pace' },
        { name: 'Tuk-tuk Service', price: '$25/day', description: 'Traditional Cambodian transportation' },
        { name: 'Bicycle Rental', price: '$5/day', description: 'Eco-friendly way to get around' }
      ]
    }

    return recommendations
  }

  const recommendations = generateRecommendations(answers)

  return (
    <div className="recommended-page">
      <button type="button" className="recommended-page__close" onClick={onClose} aria-label="Exit recommendations">
        ✕
      </button>

      <div className="recommended-page__container">
        <h1>Recommended Trip Plan</h1>

        <div className="recommendations-grid">
          {/* Hotels Section */}
          <div className="recommendation-section">
            <h2>🏨 Recommended Hotels</h2>
            <div className="recommendation-list">
              {recommendations.hotels.map((hotel, index) => (
                <div key={index} className="recommendation-item">
                  <h3>{hotel.name}</h3>
                  <p className="price">{hotel.price}</p>
                  <p className="description">{hotel.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Restaurants Section */}
          <div className="recommendation-section">
            <h2>🍽️ Recommended Restaurants</h2>
            <div className="recommendation-list">
              {recommendations.restaurants.map((restaurant, index) => (
                <div key={index} className="recommendation-item">
                  <h3>{restaurant.name}</h3>
                  <p className="price">{restaurant.price}</p>
                  <p className="description">{restaurant.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="recommendation-section">
            <h2>🎯 Trip Activities</h2>
            <div className="recommendation-list">
              {recommendations.activities.map((activity, index) => (
                <div key={index} className="recommendation-item">
                  <h3>{activity.name}</h3>
                  <p className="price">{activity.price}</p>
                  <p className="description">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transportation Section */}
          <div className="recommendation-section">
            <h2>🚗 Transportation Options</h2>
            <div className="recommendation-list">
              {recommendations.transportation.map((transport, index) => (
                <div key={index} className="recommendation-item">
                  <h3>{transport.name}</h3>
                  <p className="price">{transport.price}</p>
                  <p className="description">{transport.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedPage;