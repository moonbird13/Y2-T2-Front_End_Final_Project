import { getRecommendedProvince } from './provinceRecommendation'

import Solo from '../assets/Quiz/Solo.webp'
import friends from '../assets/Quiz/Friend.avif'

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
  solo: Solo,
  friends: friends,
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  partner: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  disability: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2c?auto=format&fit=crop&w=1200&q=80',
  pets: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
  allergy: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1200&q=80',
  none: null,
  localFood: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
  healing: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  adventure: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80',
  celebration: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
  walking: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
  motorbike: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  tuktuk: 'https://images.unsplash.com/photo-1523987355523-c7b5b6b40022?auto=format&fit=crop&w=1200&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  accommodation: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  scenery: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  cultural: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  cafeHopping: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
  fineDining: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  landmarks: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg',
  sleeping: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  sea: 'https://www.gocambodia.tours/wp-content/uploads/2024/06/Otres-Beach-travel-during-cambodia-vacations-1.jpg',
  mountain: 'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?auto=format&fit=crop&w=1200&q=80',
  city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
  dry: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  rainy: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
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
    minSelections: 1,
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
    maxSelections: 2,
    minSelections: 1,
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
    minSelections: 1,
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
    minSelections: 1,
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

