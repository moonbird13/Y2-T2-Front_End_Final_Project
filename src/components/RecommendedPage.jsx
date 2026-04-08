import { attractions } from '../data/attractions'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'

// ─── Constants ───────────────────────────────────────────────────────────────

const RECOMMEND_ME_VALUES = ['recommend me', 'recommand me']

const PROVINCE_ALIASES = {
  'sihanoukville (preah sihanouk)': 'Preah Sihanouk',
  'kompong som': 'Preah Sihanouk',
  kratie: 'Kratie',
  'kratié': 'Kratie',
}

const TRANSPORT_WINDOWS = {
  walking: [0, 15],
  motorbike: [0, 60],
  car: [0, 300],
  tuktuk: [0, 45],
}

// How quiz answers map to spending categories
const PRIORITY_TO_CATEGORY = {
  food: 'restaurant',
  accommodation: 'hotel',
  scenery: 'attraction',
  cultural: 'attraction',
}

// ─── Budget tiers (total budget per day) ─────────────────────────────────────
// Tier 1: $20–$50/day  → cheap options
// Tier 2: $50–$100/day → mid options
// Tier 3: $100+/day    → high/premium options

const getBudgetTier = (budgetPerDay) => {
  if (budgetPerDay <= 50) return 'cheap'
  if (budgetPerDay <= 100) return 'mid'
  return 'high'
}

// ─── Province normalizer ─────────────────────────────────────────────────────

const normalizeProvince = (province) => {
  const normalized = String(province || '').trim().toLowerCase()
  const aliased = PROVINCE_ALIASES[normalized] || normalized

  if (!aliased) return 'Siem Reap'

  return aliased
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const getUserCriteria = (answers) => [
  ...toArray(answers?.[1]),
  ...toArray(answers?.[2]),
  ...toArray(answers?.[3]),
  ...toArray(answers?.[4]),
  ...toArray(answers?.[5]),
  ...toArray(answers?.[6]),
  ...toArray(answers?.[100]),
  ...toArray(answers?.[101]),
]

const dedupeById = (items) => {
  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

const clamp01 = (value) => Math.max(0, Math.min(1, value))

// ─── Budget allocation ────────────────────────────────────────────────────────
// Base split: hotel 45%, restaurant 25%, attraction 30%.
// Each priority answer shifts +12% toward that category, clamped to ≥18%.

const buildBudgetPlan = (totalBudget, days, priorities) => {
  const cappedBudget = Math.min(totalBudget, 1000)
  const budgetPerDay = cappedBudget / Math.max(days, 1)

  const ratios = { hotel: 0.45, restaurant: 0.25, attraction: 0.30 }

  priorities.forEach((priority) => {
    const target = PRIORITY_TO_CATEGORY[priority]
    if (!target) return

    ratios[target] += 0.12
    const others = Object.keys(ratios).filter((k) => k !== target)
    others.forEach((k) => { ratios[k] -= 0.06 })
  })

  Object.keys(ratios).forEach((key) => {
    ratios[key] = Math.max(0.18, ratios[key])
  })

  const totalRatio = ratios.hotel + ratios.restaurant + ratios.attraction

  return {
    budgetPerDay,
    hotel:      (budgetPerDay * ratios.hotel)      / totalRatio,
    restaurant: (budgetPerDay * ratios.restaurant) / totalRatio,
    attraction: (budgetPerDay * ratios.attraction) / totalRatio,
    tier:       getBudgetTier(budgetPerDay),
  }
}

// ─── Travel-time helpers ─────────────────────────────────────────────────────

const getTravelMinutes = (item, transport) => {
  const explicit = item.travelMinutesByTransport?.[transport]
  if (typeof explicit === 'number') return explicit

  const defaults = { walking: 12, motorbike: 30, car: 90, tuktuk: 25 }
  return defaults[transport] ?? 30
}

const isWithinTransportWindow = (item, transport) => {
  if (!TRANSPORT_WINDOWS[transport]) return true
  const [, maxMinutes] = TRANSPORT_WINDOWS[transport]
  return getTravelMinutes(item, transport) <= maxMinutes
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Criteria match score: fraction of item's criteria tags that the user also selected.
 * Returns 0 if item has no criteria (so it won't crowd out real matches).
 */
const getCriteriaScore = (itemCriteria, userCriteria) => {
  if (!itemCriteria.length) return 0
  const hits = itemCriteria.filter((c) => userCriteria.includes(c)).length
  return hits / itemCriteria.length
}

/**
 * Budget proximity score.
 * Items whose average price is closest to the per-category budget limit score highest.
 * Items inside the budget range get a bonus.
 */
const getBudgetScore = (item, budgetLimit) => {
  const avg = (item.priceRange.min + item.priceRange.max) / 2
  const inRange = avg <= budgetLimit
  const closeness = 1 - Math.abs(avg - budgetLimit) / Math.max(budgetLimit, 1)
  return clamp01(closeness + (inRange ? 0.2 : 0))
}

// ─── Main picker ─────────────────────────────────────────────────────────────

/**
 * ORDER OF FILTERING:
 * 1. Province match (hard filter — only items from the selected province)
 * 2. Budget range match (hard filter — item.priceRange.min ≤ budgetLimit)
 * 3. Transport window (soft filter for restaurants/attractions)
 * 4. Criteria scoring (used for ranking, not filtering)
 * 5. Return top 3
 */
const pickTopItems = ({ provinceItems, budgetLimit, category, userCriteria, transport }) => {
  // Step 1 — province is already filtered upstream, but keep it explicit.
  let pool = [...provinceItems]

  // Step 2 — hard budget filter: item must be affordable at this budget.
  const budgetFiltered = pool.filter((item) => item.priceRange.min <= budgetLimit)

  // Step 3 — soft transport filter (skip for hotels — you stay there, not travel to it).
  const transportFiltered =
    category === 'hotel'
      ? budgetFiltered
      : budgetFiltered.filter((item) => isWithinTransportWindow(item, transport))

  // Fallback: if strict filters leave nothing, loosen budget constraint.
  const candidates = transportFiltered.length > 0 ? transportFiltered : budgetFiltered.length > 0 ? budgetFiltered : pool

  // Step 4 — score and sort: criteria is primary (60%), budget proximity secondary (30%), rating tertiary (10%).
  const scored = candidates.map((item) => {
    const criteriaScore = getCriteriaScore(item.criteria, userCriteria)
    const budgetScore   = getBudgetScore(item, budgetLimit)
    const ratingScore   = (Number(item.rating) || 0) / 5

    return {
      ...item,
      matchScore: criteriaScore,
      finalScore: criteriaScore * 0.60 + budgetScore * 0.30 + ratingScore * 0.10,
    }
  })

  scored.sort((a, b) => b.finalScore - a.finalScore || b.rating - a.rating)

  return dedupeById(scored).slice(0, 3)
}

// ─── Formatters ──────────────────────────────────────────────────────────────

const formatRating = (value) => Number(value).toFixed(1)

// ─── Sub-components ──────────────────────────────────────────────────────────

function RecommendationCard({ item, transport, category, onAddFavorite, isFavorite }) {
  const showTravel = category !== 'hotel'

  return (
    <article className="recommendation-card">
      <div className="recommendation-card__image-container">
        <img src={item.image} alt={item.name} className="recommendation-card__image" />
        <button
          type="button"
          className={`favorite-star ${isFavorite ? 'favorite-star--active' : ''}`}
          onClick={() => onAddFavorite({ ...item, category })}
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
          <p>Match: {Math.round(item.matchScore * 100)}% · Rating: {formatRating(item.rating)} / 5</p>
          <p>📍 {item.direction}</p>
          {item.mapUrl && (
            <p>
              <a href={item.mapUrl} target="_blank" rel="noreferrer">Open map ↗</a>
            </p>
          )}
          {showTravel && (
            <p>🚗 ~{getTravelMinutes(item, transport)} mins away ({transport})</p>
          )}
          {item.phone && <p>📞 {item.phone}</p>}
          {item.telegram && <p>💬 {item.telegram}</p>}
        </div>

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
              isFavorite={favorites.some(
                (fav) => fav.id === item.id && fav.category === (item.category || category)
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

function RecommendedPage({ answers, onAddFavorite, favorites }) {
  const budget   = Number(answers?.budget) || 1000
  const days     = Number(answers?.days) || 3
  const requestedProvince = String(answers?.requestedProvince || answers?.province || '').trim()
  const isRecommendMe     = RECOMMEND_ME_VALUES.includes(requestedProvince.toLowerCase())
  const province          = normalizeProvince(answers?.province || 'Siem Reap')

  const userCriteria    = getUserCriteria(answers)
  const priorities      = toArray(answers?.[5])
  const selectedTransport = toArray(answers?.[4])[0] || 'walking'
  const budgetPlan      = buildBudgetPlan(budget, days, priorities)

  // ── Filter by province first ──────────────────────────────────────────────
  const hotelsForProvince      = hotels.filter((h) => normalizeProvince(h.province) === province)
  const restaurantsForProvince = restaurants.filter((r) => normalizeProvince(r.province) === province)
  const attractionsForProvince = attractions.filter((a) => normalizeProvince(a.province) === province)

  // ── Pick top 3 per category ───────────────────────────────────────────────
  const filteredHotels = pickTopItems({
    provinceItems: hotelsForProvince,
    budgetLimit:   budgetPlan.hotel,
    category:      'hotel',
    userCriteria,
    transport:     selectedTransport,
  })

  const filteredRestaurants = pickTopItems({
    provinceItems: restaurantsForProvince,
    budgetLimit:   budgetPlan.restaurant,
    category:      'restaurant',
    userCriteria,
    transport:     selectedTransport,
  })

  const filteredAttractions = pickTopItems({
    provinceItems: attractionsForProvince,
    budgetLimit:   budgetPlan.attraction,
    category:      'attraction',
    userCriteria,
    transport:     selectedTransport,
  })

  return (
    <div className="recommended-page">
      <header className="recommended-page__header">
        <h1>KOMRONG TRIP</h1>
        <p>OUR RECOMMENDATION FOR {province.toUpperCase()}</p>
        {isRecommendMe && (
          <span className="recommended-page__note">Province auto-selected from your quiz answers.</span>
        )}
        <span className="recommended-page__note">
          Budget: ${budget} total · {days} day{days !== 1 ? 's' : ''} · ~${Math.round(budgetPlan.budgetPerDay)}/day ({budgetPlan.tier} tier)
        </span>
        <span className="recommended-page__note">Transport: {selectedTransport}</span>
      </header>

      <div className="recommended-page__sections">
        <RecommendationSection
          title="🏨 HOTEL RECOMMENDATIONS"
          items={filteredHotels}
          emptyMessage={`No hotels in ${province} matched your budget of $${Math.round(budgetPlan.hotel)}/night.`}
          transport={selectedTransport}
          category="hotel"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
        />

        <RecommendationSection
          title="🍽️ RESTAURANT RECOMMENDATIONS"
          items={filteredRestaurants}
          emptyMessage={`No restaurants in ${province} matched your budget of $${Math.round(budgetPlan.restaurant)}/meal.`}
          transport={selectedTransport}
          category="restaurant"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
        />

        <RecommendationSection
          title="🏛️ ATTRACTION RECOMMENDATIONS"
          items={filteredAttractions}
          emptyMessage={`No attractions in ${province} matched your budget of $${Math.round(budgetPlan.attraction)}/activity.`}
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
