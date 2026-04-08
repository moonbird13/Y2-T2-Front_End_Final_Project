import { getRecommendedProvince } from './provinceRecommendation'

// Quiz Questions with Conditional Logic
// Base IDs:
// 1 - Who are you travelling with?
// 2 - Special conditions (conditional content based on Q1 answer)
// 3 - Purpose of trip
// 4 - Preferred transportation
// 5 - Priority on trip
// 6 - Ideal activity
// Optional recommend flow IDs:
// 100 - Preference
// 101 - Season

// Placeholder images - replace with actual image imports as needed
const placeholderImages = {
  solo: 'https://via.placeholder.com/150?text=Solo',
  friends: 'https://via.placeholder.com/150?text=Friends',
  family: 'https://via.placeholder.com/150?text=Family',
  partner: 'https://via.placeholder.com/150?text=Partner',
  disability: 'https://via.placeholder.com/150?text=Disability',
  pets: 'https://via.placeholder.com/150?text=Pets',
  allergy: 'https://via.placeholder.com/150?text=Allergy',
  none: 'https://via.placeholder.com/150?text=None',
  localFood: 'https://via.placeholder.com/150?text=Local+Food',
  healing: 'https://via.placeholder.com/150?text=Healing',
  adventure: 'https://via.placeholder.com/150?text=Adventure',
  celebration: 'https://via.placeholder.com/150?text=Celebration',
  walking: 'https://via.placeholder.com/150?text=Walking',
  motorbike: 'https://via.placeholder.com/150?text=Motorbike',
  car: 'https://via.placeholder.com/150?text=Car',
  tuktuk: 'https://via.placeholder.com/150?text=Tuk-Tuk',
  food: 'https://via.placeholder.com/150?text=Food',
  accommodation: 'https://via.placeholder.com/150?text=Accommodation',
  scenery: 'https://via.placeholder.com/150?text=Scenery',
  cultural: 'https://via.placeholder.com/150?text=Cultural',
  cafeHopping: 'https://via.placeholder.com/150?text=Cafe-Hopping',
  fineDining: 'https://via.placeholder.com/150?text=Fine-Dining',
  landmarks: 'https://via.placeholder.com/150?text=Landmarks',
  sleeping: 'https://via.placeholder.com/150?text=Sleeping',
  sea: 'https://via.placeholder.com/150?text=Sea',
  mountain: 'https://via.placeholder.com/150?text=Mountain',
  city: 'https://via.placeholder.com/150?text=City',
  dry: 'https://via.placeholder.com/150?text=Dry+Season',
  rainy: 'https://via.placeholder.com/150?text=Rainy+Season',
}

const baseQuizQuestions = [
  // Q1: Who are you travelling with?
  {
    id: 1,
    question: 'Who are you travelling with?',
    type: 'standard',
    answers: [
      { id: 'solo', label: 'Solo', image: placeholderImages.solo },
      { id: 'friends', label: 'Friends', image: placeholderImages.friends },
      { id: 'family', label: 'Family', image: placeholderImages.family },
      { id: 'partner', label: 'Partner', image: placeholderImages.partner },
    ],
    nextQuestion: 2,
  },

  // Q2: Special conditions (conditional answers based on Q1)
  {
    id: 2,
    questionSolo: 'Which of these best describes your situation?',
    questionGroup: 'Will there be any..?',
    type: 'conditional',
    maxSelections: 2,
    minSelections: 2,
    answersSolo: [
      { id: 'disability', label: 'Have disability', image: placeholderImages.disability },
      { id: 'pets', label: 'Travel with pets', image: placeholderImages.pets },
      { id: 'allergy', label: 'Have allergy/phobia', image: placeholderImages.allergy },
      { id: 'none', label: 'None', image: placeholderImages.none },
    ],
    answersGroup: [
      { id: 'disability', label: 'Disabled person', image: placeholderImages.disability },
      { id: 'pets', label: 'Pets', image: placeholderImages.pets },
      { id: 'allergy', label: 'Person with allergy/phobia', image: placeholderImages.allergy },
      { id: 'none', label: 'None', image: placeholderImages.none },
    ],
    nextQuestion: 3,
  },

  // Q3: What is the purpose of this trip?
  {
    id: 3,
    question: 'What is the purpose of this trip?',
    type: 'standard',
    answers: [
      { id: 'localFood', label: 'Local Food', image: placeholderImages.localFood },
      { id: 'healing', label: 'Healing', image: placeholderImages.healing },
      { id: 'adventure', label: 'Adventure', image: placeholderImages.adventure },
      { id: 'celebration', label: 'Celebration', image: placeholderImages.celebration },
    ],
    nextQuestion: 4,
  },

  // Q4: What is your preferred transportation?
  {
    id: 4,
    question: 'What is your preferred transportation? (During travel time)',
    type: 'standard',
    answers: [
      { id: 'walking', label: 'Walking', image: placeholderImages.walking },
      { id: 'motorbike', label: 'Motorbike', image: placeholderImages.motorbike },
      { id: 'car', label: 'Car', image: placeholderImages.car },
      { id: 'tuktuk', label: 'Tuk-Tuk', image: placeholderImages.tuktuk },
    ],
    nextQuestion: 5,
  },

  // Q5: What do you prioritize on your trip? (recommends place with more quantity)
  {
    id: 5,
    question: 'What do you prioritize on your trip?',
    type: 'standard',
    maxSelections: 2,
    minSelections: 2,
    answers: [
      { id: 'food', label: 'Food', image: placeholderImages.food },
      { id: 'accommodation', label: 'Accommodation', image: placeholderImages.accommodation },
      { id: 'scenery', label: 'Scenery', image: placeholderImages.scenery },
      { id: 'cultural', label: 'Cultural experience', image: placeholderImages.cultural },
    ],
    nextQuestion: 6,
  },

  // Q6: What is your ideal activity?
  {
    id: 6,
    question: 'What is your ideal activity?',
    type: 'standard',
    maxSelections: 2,
    minSelections: 2,
    answers: [
      { id: 'cafeHopping', label: 'Cafe-hopping', image: placeholderImages.cafeHopping },
      { id: 'fineDining', label: 'Fine-dining', image: placeholderImages.fineDining },
      { id: 'landmarks', label: 'Exploring landmarks', image: placeholderImages.landmarks },
      { id: 'sleeping', label: 'Sleeping in', image: placeholderImages.sleeping },
    ],
    nextQuestion: null, // Last question
  },
]

const recommendationQuestions = [
  {
    id: 100,
    question: 'Choose your preference',
    type: 'standard',
    answers: [
      { id: 'sea', label: 'Sea', image: placeholderImages.sea },
      { id: 'mountain', label: 'Mountain', image: placeholderImages.mountain },
      { id: 'landmark', label: 'Landmark', image: placeholderImages.landmarks },
      { id: 'city', label: 'City', image: placeholderImages.city },
    ],
    nextQuestion: 101,
  },
  {
    id: 101,
    question: 'Which season do you prefer to travel more?',
    type: 'standard',
    answers: [
      { id: 'dry', label: 'Dry Season', image: placeholderImages.dry },
      { id: 'rainy', label: 'Rainy Season', image: placeholderImages.rainy },
    ],
    nextQuestion: 1,
  },
]

const shouldUseRecommendationFlow = (province) => {
  const normalizedProvince = String(province || '').trim().toLowerCase()
  return normalizedProvince === 'recommend me' || normalizedProvince === 'recommand me'
}

export const getQuizQuestions = (province) => {
  if (shouldUseRecommendationFlow(province)) {
    return [...recommendationQuestions, ...baseQuizQuestions]
  }

  return baseQuizQuestions
}

// This helper can be used later to compute a suggested province after Q100 and Q101 are answered.
export const resolveRecommendedProvince = (selectedAnswers) => {
  const preference = selectedAnswers[100]
  const season = selectedAnswers[101]

  if (!preference || !season) {
    return null
  }

  return getRecommendedProvince(preference, season)
}

