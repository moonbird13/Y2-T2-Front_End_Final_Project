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

const BUDGET_CAPS = [50, 100]

// ─── Budget tiers (total budget) ─────────────────────────────────────────────
// Tier 1: $20–$50 total  → cheap options
// Tier 2: $50–$100 total → mid options
// Tier 3: $100+ total    → high/premium options

const getBudgetTier = (budget) => {
  if (budget <= 50) return 'cheap'
  if (budget <= 100) return 'mid'
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

const getPrimaryPriority = (priorities) => priorities[0] || null

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
// The budget is split by the user's main priority and total budget tier.
// This keeps the recommendation set within the user's total budget.

const getBudgetCap = (budget) => {
  if (budget <= 50) return 50
  if (budget <= 100) return 100
  return budget
}

const getBudgetRatios = (budgetCap, primaryPriority) => {
  if (budgetCap <= 50) {
    if (primaryPriority === 'food') {
      return { hotel: 0.30, restaurant: 0.40, attraction: 0.30 }
    }

    if (primaryPriority === 'accommodation') {
      return { hotel: 0.40, restaurant: 0.30, attraction: 0.30 }
    }

    return { hotel: 0.33, restaurant: 0.34, attraction: 0.33 }
  }

  if (budgetCap <= 100) {
    if (primaryPriority === 'food') {
      return { hotel: 0.30, restaurant: 0.45, attraction: 0.25 }
    }

    if (primaryPriority === 'accommodation') {
      return { hotel: 0.45, restaurant: 0.30, attraction: 0.25 }
    }

    return { hotel: 0.35, restaurant: 0.35, attraction: 0.30 }
  }

  if (primaryPriority === 'food') {
    return { hotel: 0.25, restaurant: 0.60, attraction: 0.15 }
  }

  if (primaryPriority === 'accommodation') {
    return { hotel: 0.60, restaurant: 0.25, attraction: 0.15 }
  }

  return { hotel: 0.40, restaurant: 0.35, attraction: 0.25 }
}

const buildBudgetPlan = (totalBudget, days, priorities) => {
  const cappedBudget = Math.min(totalBudget, 1000)
  const budgetPerDay = cappedBudget / Math.max(days, 1)
  const budgetCap = getBudgetCap(cappedBudget)
  const primaryPriority = getPrimaryPriority(priorities)
  const ratios = getBudgetRatios(budgetCap, primaryPriority)

  return {
    budgetPerDay,
    budgetCap,
    primaryPriority,
    hotel: budgetCap * ratios.hotel,
    restaurant: budgetCap * ratios.restaurant,
    attraction: budgetCap * ratios.attraction,
    tier: getBudgetTier(budgetCap),
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
const getBudgetScore = (item, budgetLimit, category, primaryPriority) => {
  const avg = (item.priceRange.min + item.priceRange.max) / 2
  const normalized = avg / Math.max(budgetLimit, 1)

  if (primaryPriority === 'food' && category === 'restaurant') {
    return clamp01(normalized)
  }

  if (primaryPriority === 'accommodation' && category === 'hotel') {
    return clamp01(normalized)
  }

  if (category === 'hotel' || category === 'restaurant') {
    return clamp01(1 - normalized)
  }

  return clamp01(1 - Math.abs(normalized - 0.45))
}

const getPriorityBoost = (item, priorities, category) => {
  const boosts = []

  if (category === 'restaurant' && priorities.includes('food')) {
    boosts.push(item.criteria.includes('food') ? 0.25 : 0)
    boosts.push(item.criteria.includes('fineDining') ? 0.12 : 0)
  }

  if (category === 'hotel' && priorities.includes('accommodation')) {
    boosts.push(item.criteria.includes('accommodation') ? 0.20 : 0)
    boosts.push(item.criteria.includes('disabilityFriendly') ? 0.12 : 0)
  }

  if (category === 'attraction' && priorities.includes('scenery')) {
    boosts.push(item.criteria.includes('scenery') ? 0.18 : 0)
  }

  return Math.min(0.35, boosts.reduce((sum, value) => sum + value, 0))
}

const getPurposeBoost = (item, purposes) => {
  if (!purposes.length) return 0

  let boost = 0
  if (purposes.includes('localFood') && item.criteria.includes('localFood')) boost += 0.12
  if (purposes.includes('healing') && item.criteria.includes('healing')) boost += 0.10
  if (purposes.includes('adventure') && item.criteria.includes('adventure')) boost += 0.10
  if (purposes.includes('celebration') && item.criteria.includes('celebration')) boost += 0.10

  return Math.min(0.25, boost)
}

const getAccessibilityBoost = (item, needsAccessibility, category) => {
  if (!needsAccessibility || category !== 'hotel') return 0
  return item.criteria.includes('disabilityFriendly') ? 0.18 : 0
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
const pickTopItems = ({ provinceItems, budgetLimit, category, userCriteria, transport, primaryPriority, needsAccessibility, purposes }) => {
  // Step 1 — province is already filtered upstream, but keep it explicit.
  let pool = [...provinceItems]

  // Step 2 — hard budget filter: item must be affordable within category budget and total budget cap.
  const budgetFiltered = pool.filter((item) => item.priceRange.min <= budgetLimit)

  // Step 3 — soft transport filter (skip for hotels — you stay there, not travel to it).
  const transportFiltered =
    category === 'hotel'
      ? budgetFiltered
      : budgetFiltered.filter((item) => isWithinTransportWindow(item, transport))

  const accessibilityFiltered =
    category === 'hotel' && needsAccessibility
      ? transportFiltered.filter((item) => item.criteria.includes('disabilityFriendly'))
      : transportFiltered

  // Fallback: if strict filters leave nothing, keep the nearest valid items in the province.
  const candidates = accessibilityFiltered.length > 0 ? accessibilityFiltered : transportFiltered.length > 0 ? transportFiltered : budgetFiltered.length > 0 ? budgetFiltered : pool

  // Step 4 — score and sort: criteria is primary, budget fit changes by priority, then rating.
  const scored = candidates.map((item) => {
    const criteriaScore = getCriteriaScore(item.criteria, userCriteria)
    const budgetScore   = getBudgetScore(item, budgetLimit, category, primaryPriority)
    const ratingScore   = (Number(item.rating) || 0) / 5
    const purposeBoost   = getPurposeBoost(item, purposes)
    const priorityBoost  = getPriorityBoost(item, prioritiesFromUser(primaryPriority, userCriteria), category)
    const accessibilityBoost = getAccessibilityBoost(item, needsAccessibility, category)

    return {
      ...item,
      matchScore: criteriaScore,
      finalScore: criteriaScore * 0.45 + budgetScore * 0.25 + ratingScore * 0.10 + purposeBoost * 0.10 + priorityBoost * 0.07 + accessibilityBoost * 0.03,
    }
  })

  scored.sort((a, b) => b.finalScore - a.finalScore || b.rating - a.rating)

  return dedupeById(scored).slice(0, 3)
}

const prioritiesFromUser = (primaryPriority, userCriteria) => {
  const priorities = []

  if (primaryPriority === 'food' || userCriteria.includes('food')) priorities.push('food')
  if (primaryPriority === 'accommodation' || userCriteria.includes('accommodation')) priorities.push('accommodation')
  if (userCriteria.includes('scenery')) priorities.push('scenery')

  return priorities
}

// ─── Formatters ──────────────────────────────────────────────────────────────

const formatRating = (value) => Number(value).toFixed(1)

// ─── Sub-components ──────────────────────────────────────────────────────────

function RecommendationCard({ item, transport, category, onAddFavorite, isFavorite, userCriteria }) {
  const showTravel = category !== 'hotel'
  const hotelNotes = []

  if (category === 'hotel') {
    if (userCriteria.includes('disability') && item.criteria.includes('disabilityFriendly')) {
      hotelNotes.push('Disability friendly')
    }

    if (userCriteria.includes('pets') && item.criteria.includes('petFriendly')) {
      hotelNotes.push('Pet friendly')
    }
  }

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
          <p>Rating: {formatRating(item.rating)} / 5</p>
          {hotelNotes.length > 0 && <p>{hotelNotes.join(' · ')}</p>}
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

function RecommendationSection({ title, items, emptyMessage, transport, category, onAddFavorite, favorites, userCriteria }) {
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
              userCriteria={userCriteria}
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
  const purposes        = toArray(answers?.[3])
  const selectedTransport = toArray(answers?.[4])[0] || 'walking'
  const budgetPlan      = buildBudgetPlan(budget, days, priorities)
  const needsAccessibility = userCriteria.includes('disability')

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
    primaryPriority: budgetPlan.primaryPriority,
    needsAccessibility,
    purposes,
  })

  const filteredRestaurants = pickTopItems({
    provinceItems: restaurantsForProvince,
    budgetLimit:   budgetPlan.restaurant,
    category:      'restaurant',
    userCriteria,
    transport:     selectedTransport,
    primaryPriority: budgetPlan.primaryPriority,
    needsAccessibility,
    purposes,
  })

  const filteredAttractions = pickTopItems({
    provinceItems: attractionsForProvince,
    budgetLimit:   budgetPlan.attraction,
    category:      'attraction',
    userCriteria,
    transport:     selectedTransport,
    primaryPriority: budgetPlan.primaryPriority,
    needsAccessibility,
    purposes,
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
          Budget: ${budget} total · {days} day{days !== 1 ? 's' : ''} · category cap ${budgetPlan.budgetCap} max ({budgetPlan.tier} tier)
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
          userCriteria={userCriteria}
        />

        <RecommendationSection
          title="🍽️ RESTAURANT RECOMMENDATIONS"
          items={filteredRestaurants}
          emptyMessage={`No restaurants in ${province} matched your budget of $${Math.round(budgetPlan.restaurant)}/meal.`}
          transport={selectedTransport}
          category="restaurant"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
          userCriteria={userCriteria}
        />

        <RecommendationSection
          title="🏛️ ATTRACTION RECOMMENDATIONS"
          items={filteredAttractions}
          emptyMessage={`No attractions in ${province} matched your budget of $${Math.round(budgetPlan.attraction)}/activity.`}
          transport={selectedTransport}
          category="attraction"
          onAddFavorite={onAddFavorite}
          favorites={favorites}
          userCriteria={userCriteria}
        />
      </div>
    </div>
  )
}

export default RecommendedPage
