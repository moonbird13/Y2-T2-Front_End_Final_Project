// Province recommendation data used when user selects "Recommend me".

export const preferenceProvinces = {
  sea: ['Kampot', 'Koh Kong', 'Preah Sihanouk', 'Kep', 'Kratie', 'Stung Treng'],
  mountain: [
    'Siem Reap',
    'Banteay Meanchey',
    'Battambang',
    'Kampong Speu',
    'Kampong Chhnang',
    'Mondulkiri',
    'Oddar Meanchey',
    'Pailin',
    'Preah Vihear',
    'Ratanakiri',
    'Pursat',
  ],
  landmark: [
    'Siem Reap',
    'Banteay Meanchey',
    'Battambang',
    'Kandal',
    'Kampong Cham',
    'Kampong Chhnang',
    'Kampong Speu',
    'Kampong Thom',
    'Oddar Meanchey',
    'Preah Vihear',
    'Tboung Khmum',
  ],
  city: ['Siem Reap', 'Battambang', 'Takeo', 'Prey Veng', 'Svay Rieng'],
}

export const seasonProvinces = {
  rainy: [
    'Takeo',
    'Mondulkiri',
    'Battambang',
    'Pursat',
    'Kampong Speu',
    'Kampong Thom',
    'Tboung Khmum',
    'Banteay Meanchey',
    'Kampong Cham',
  ],
  dry: [
    'Preah Sihanouk',
    'Mondulkiri',
    'Koh Kong',
    'Ratanakiri',
    'Stung Treng',
    'Kratie',
    'Preah Vihear',
    'Oddar Meanchey',
    'Pailin',
    'Kampong Chhnang',
    'Kandal',
    'Prey Veng',
    'Svay Rieng',
    'Siem Reap',
    'Kampot',
    'Kep',
  ],
}

const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)]

// Picks one province based on preference + season.
export function getRecommendedProvince(preference, season) {
  const preferencePool = preferenceProvinces[preference] || []
  const seasonPool = seasonProvinces[season] || []

  const intersection = preferencePool.filter((province) => seasonPool.includes(province))

  if (intersection.length > 0) {
    return getRandomItem(intersection)
  }

  const fallbackPool = preferencePool.length > 0 ? preferencePool : seasonPool
  return fallbackPool.length > 0 ? getRandomItem(fallbackPool) : null
}
