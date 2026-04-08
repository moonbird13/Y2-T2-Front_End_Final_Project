import { attractions } from '../data/attractions'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'

const RECOMMEND_ME_VALUES = ['recommend me', 'recommand me']

const PROVINCE_ALIASES = {
  'sihanoukville (preah sihanouk)': 'Preah Sihanouk',
  kratie: 'Kratie',
  'kratié': 'Kratie',
}

const TRANSPORT_WINDOWS = {
  walking: [5, 10],
  motorbike: [15, 60],
  car: [45, 300],
  tuktuk: [20, 45],
}

const PRIORITY_TO_CATEGORY = {
  food: 'restaurant',
  accommodation: 'hotel',
  scenery: 'attraction',
  cultural: 'attraction',
}

const PURPOSE_TO_TAGS = {
  localFood: ['food', 'localFood', 'fineDining'],
  healing: ['healing', 'scenery', 'sleeping'],
  adventure: ['adventure', 'landmarks', 'motorbike'],
  celebration: ['fineDining', 'friends', 'city'],
}

const normalizeProvince = (province) => {
  const normalized = String(province || '').trim().toLowerCase()
  const aliased = PROVINCE_ALIASES[normalized] || normalized

  if (!aliased) {
    return 'Siem Reap'
  }

  return aliased
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const getUserCriteria = (answers) => {
  return [
    ...toArray(answers?.[1]),
    ...toArray(answers?.[2]),
    ...toArray(answers?.[3]),
    ...toArray(answers?.[4]),
    ...toArray(answers?.[5]),
    ...toArray(answers?.[6]),
    ...toArray(answers?.[100]),
    ...toArray(answers?.[101]),
  ]
}

const getMatchScore = (itemCriteria, userCriteria) => {
  if (!itemCriteria.length) {
    return 0
  }

  const hits = itemCriteria.filter((criterion) => userCriteria.includes(criterion)).length
  return hits / itemCriteria.length
}

const dedupeById = (items) => {
  const seen = new Set()

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}

const clamp01 = (value) => Math.max(0, Math.min(1, value))

const buildBudgetPlan = (totalBudget, days, priorities) => {
  const cappedBudget = Math.min(totalBudget, 1000)
  const budgetPerDay = cappedBudget / Math.max(days, 1)

  const ratios = {
    hotel: 0.45,
    restaurant: 0.25,
    attraction: 0.3,
  }

  priorities.forEach((priority) => {
    const target = PRIORITY_TO_CATEGORY[priority]
    if (!target) {
      return
    }

    ratios[target] += 0.12

    if (target === 'hotel') {
      ratios.restaurant -= 0.06
      ratios.attraction -= 0.06
    }

    if (target === 'restaurant') {
      ratios.hotel -= 0.06
      ratios.attraction -= 0.06
    }

    if (target === 'attraction') {
      ratios.hotel -= 0.06
      ratios.restaurant -= 0.06
    }
  })

  Object.keys(ratios).forEach((key) => {
    ratios[key] = Math.max(0.18, ratios[key])
  })

  const totalRatio = ratios.hotel + ratios.restaurant + ratios.attraction

  return {
    budgetPerDay,
    hotel: (budgetPerDay * ratios.hotel) / totalRatio,
    restaurant: (budgetPerDay * ratios.restaurant) / totalRatio,
    attraction: (budgetPerDay * ratios.attraction) / totalRatio,
  }
}

const getTravelMinutes = (item, transport) => {
  const explicit = item.travelMinutesByTransport?.[transport]
  if (typeof explicit === 'number') {
    return explicit
  }

  if (transport === 'walking') {
    return item.criteria.includes('walking') ? 8 : 14
  }

  if (transport === 'motorbike') {
    return item.criteria.includes('motorbike') ? 26 : 52
  }

  if (transport === 'car') {
    return item.criteria.includes('car') ? 80 : 180
  }

  return item.criteria.includes('tuktuk') ? 28 : 40
}

const isWithinTransportWindow = (item, transport) => {
  const window = TRANSPORT_WINDOWS[transport]
  if (!window) {
    return true
  }

  const [minMinutes, maxMinutes] = window
  const minutes = getTravelMinutes(item, transport)
  return minutes >= minMinutes && minutes <= maxMinutes
}

const getPurposeBoost = (item, purposes) => {
  if (!purposes.length) {
    return 0
  }

  let boost = 0
  purposes.forEach((purpose) => {
    const mappedTags = PURPOSE_TO_TAGS[purpose] || []
    if (mappedTags.some((tag) => item.criteria.includes(tag))) {
      boost += 0.08
    }
  })

  return Math.min(boost, 0.22)
}

const getPriorityBoost = (item, priorities, category) => {
  if (category !== 'restaurant' || !priorities.includes('food')) {
    return 0
  }

  let boost = 0

  if (item.criteria.includes('food')) {
    boost += 0.15
  }

  if (item.criteria.includes('fineDining')) {
    boost += 0.1
  }

  if (item.source === 'user-tier' && item.tier === 'mid') {
    boost += 0.08
  }

  return Math.min(boost, 0.25)
}

const getPriceBand = (item) => {
  const averagePrice = (item.priceRange.min + item.priceRange.max) / 2

  if (averagePrice <= 15) {
    return 'cheap'
  }

  if (averagePrice <= 60) {
    return 'mid'
  }

  return 'high'
}

const getPreferredBands = (budgetLimit, preferPremium) => {
  if (budgetLimit <= 20) {
    return ['cheap']
  }

  if (budgetLimit <= 70) {
    return preferPremium ? ['mid', 'cheap'] : ['mid', 'cheap']
  }

  return preferPremium ? ['high', 'mid'] : ['mid', 'high']
}

const buildBandRankMap = (preferredBands) => {
  return preferredBands.reduce((accumulator, band, index) => {
    accumulator[band] = index
    return accumulator
  }, {})
}

const getPriceScore = (item, budgetLimit, preferPremium) => {
  const averagePrice = (item.priceRange.min + item.priceRange.max) / 2
  const distance = Math.abs(averagePrice - budgetLimit)
  const closenessScore = 1 - distance / Math.max(budgetLimit, 1)
  const preferredBands = getPreferredBands(budgetLimit, preferPremium)
  const bandBonus = preferredBands.includes(getPriceBand(item)) ? 0.18 : 0
  return clamp01(closenessScore + bandBonus)
}

const isWithinBudgetRange = (item, budgetLimit) => {
  return budgetLimit >= item.priceRange.min && budgetLimit <= item.priceRange.max
}

const formatRating = (value) => Number(value).toFixed(1)

function RecommendationCard({ item, transport, category, onAddFavorite, isFavorite }) {
  const showTravel = category !== 'hotel'

  return (
    <article className="recommendation-card">
      <div className="recommendation-card__image-container">
        <img src={item.image} alt={item.name} className="recommendation-card__image" />
        <button
          type="button"
          className={`favorite-star ${isFavorite ? 'favorite-star--active' : ''}`}
          onClick={() => onAddFavorite(item)}
          aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
        >
          ★
        </button>
      </div>

      <div className="recommendation-card__content">
        <div className="recommendation-card__title-row">
          <h3>{item.name}</h3>
          <p className="recommendation-card__price">{item.priceRange.label}</p>
        </div>

        <div className="recommendation-card__meta">
          <p>Match score: {Math.round(item.matchScore * 100)}%</p>
          <p>Rating: {formatRating(item.rating)} / 5</p>
          <p>Direction: {item.direction}</p>
          {item.mapUrl && (
            <p>
              Location: <a href={item.mapUrl} target="_blank" rel="noreferrer">Open map</a>
            </p>
          )}
          {showTravel && <p>Estimated {transport}: {getTravelMinutes(item, transport)} mins from hotel</p>}
          <p>Phone: {item.phone}</p>
          <p>Telegram: {item.telegram}</p>
          <p>Criteria: {item.criteria.join(', ')}</p>
        </div>

        {/* Placeholder action for future details page/modal */}
        <button type="button" className="recommendation-card__button">
          View More
        </button>
      </div>
    </article>
  )
}

function RecommendationSection({ title, items, emptyMessage, transport, category, onAddFavorite, favorites }) {
  return (
    <section className="recommendation-block">
      <h2>{title}</h2>

      {items.length === 0 ? (
        <p className="recommendation-block__empty">{emptyMessage}</p>
      ) : (
        <div className="recommendation-block__list">
          {items.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              transport={transport}
              category={category}
              onAddFavorite={onAddFavorite}
              isFavorite={favorites.some(fav => fav.id === item.id && fav.category === category)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function RecommendedPage({ answers, onAddFavorite, favorites }) {
  const budget = Number(answers?.budget) || 1000
  const days = Number(answers?.days) || 3
  const requestedProvince = String(answers?.requestedProvince || answers?.province || '').trim()
  const isRecommendMe = RECOMMEND_ME_VALUES.includes(requestedProvince.toLowerCase())
  const province = normalizeProvince(answers?.province || 'Siem Reap')

  const userCriteria = getUserCriteria(answers)
  const purposes = toArray(answers?.[3])
  const priorities = toArray(answers?.[5])
  const selectedTransport = toArray(answers?.[4])[0] || 'walking'
  const budgetPlan = buildBudgetPlan(budget, days, priorities)

  const scoreAndSort = (items, category, budgetLimit) => {
    const prioritizedCategory = priorities.map((item) => PRIORITY_TO_CATEGORY[item])

    return items
      .map((item) => ({
        ...item,
        matchScore: getMatchScore(item.criteria, userCriteria),
        purposeBoost: getPurposeBoost(item, purposes),
        priorityBoost: getPriorityBoost(item, priorities, category),
        priceScore: getPriceScore(item, budgetLimit, prioritizedCategory.includes(category)),
      }))
      .map((item) => ({
        ...item,
        finalScore: item.matchScore * 0.6 + item.priceScore * 0.2 + item.purposeBoost * 0.1 + item.priorityBoost * 0.1,
      }))
      .sort((a, b) => b.finalScore - a.finalScore || b.rating - a.rating)
  }

  const pickTopThree = ({ provinceItems, budgetLimit, category }) => {
    const transportFilteredProvince = category === 'hotel' ? provinceItems : provinceItems.filter((item) => isWithinTransportWindow(item, selectedTransport))
    const isFoodPriority = priorities.includes('food')

    // Rule 1: budget range check first. Item appears only if budget fits its full range.
    const budgetFilteredProvince = transportFilteredProvince.filter((item) => isWithinBudgetRange(item, budgetLimit))

    const sortedProvince = scoreAndSort(budgetFilteredProvince, category, budgetLimit)

    // Rule 2: criteria threshold back to 50%.
    const strictProvince = sortedProvince.filter((item) => item.matchScore >= 0.5)
    const softFill = sortedProvince.slice(0, 6)

    let userTierPriority = []
    if (category === 'restaurant' && isFoodPriority) {
      const preferredBands = getPreferredBands(budgetLimit, true)
      const bandRankMap = buildBandRankMap(preferredBands)

      userTierPriority = sortedProvince
        .filter((item) => item.source === 'user-tier')
        .map((item) => ({
          ...item,
          bandRank: bandRankMap[item.tier] ?? 99,
          distanceFromBudget: Math.abs(((item.priceRange.min + item.priceRange.max) / 2) - budgetLimit),
        }))
        .sort((a, b) => a.bandRank - b.bandRank || a.distanceFromBudget - b.distanceFromBudget)
        .slice(0, 3)
    }

    const merged = dedupeById([
      ...userTierPriority,
      ...strictProvince,
      ...softFill,
    ])
    return merged.slice(0, 3)
  }

  const hotelsForProvince = hotels.filter((item) => normalizeProvince(item.province) === province)
  const restaurantsForProvince = restaurants.filter((item) => normalizeProvince(item.province) === province)
  const attractionsForProvince = attractions.filter((item) => normalizeProvince(item.province) === province)

  const filteredHotels = pickTopThree({
    provinceItems: hotelsForProvince,
    budgetLimit: budgetPlan.hotel,
    category: 'hotel',
  })
  const filteredRestaurants = pickTopThree({
    provinceItems: restaurantsForProvince,
    budgetLimit: budgetPlan.restaurant,
    category: 'restaurant',
  })
  const filteredAttractions = pickTopThree({
    provinceItems: attractionsForProvince,
    budgetLimit: budgetPlan.attraction,
    category: 'attraction',
  })

  return (
    <div className="recommended-page">
      <header className="recommended-page__header">
        <h1>KOMRONG TRIP</h1>
        <p>OUR RECOMMANDATION FOR {province}</p>
        {isRecommendMe && <span className="recommended-page__note">Province auto-selected from your first two quiz answers.</span>}
        <span className="recommended-page__note">Transport mode: {selectedTransport}</span>
      </header>

      <div className="recommended-page__sections">
        <RecommendationSection
          title="HOTEL RECOMMANDATION"
          items={filteredHotels}
          emptyMessage="No hotels in this province matched your budget range and at least 50% of your criteria."
          transport={selectedTransport}
          category="hotel"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
        />

        <RecommendationSection
          title="RESTAURANT RECOMMANDATION"
          items={filteredRestaurants}
          emptyMessage="No restaurants in this province matched your budget range and at least 50% of your criteria."
          transport={selectedTransport}
          category="restaurant"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
        />

        <RecommendationSection
          title="ATTRACTION RECOMMANDATION"
          items={filteredAttractions}
          emptyMessage="No attractions in this province matched your budget range and at least 50% of your criteria."
          transport={selectedTransport}
          category="attraction"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
        />
      </div>
    </div>
  )
}

export default RecommendedPage