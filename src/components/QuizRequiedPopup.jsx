import { useRef } from 'react'

function QuizRequiedPopup({ open, onClose, onContinue }) {
  if (!open) {
    return null
  }

  const formRef = useRef(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    
    const formData = new FormData(formRef.current)
    const province = formData.get('province')
    const days = formData.get('days')
    const budget = formData.get('budget')

    if (!province || !days || !budget) {
      alert('Please fill in all fields')
      return
    }

    onContinue({
      province,
      days: parseInt(days),
      budget: parseFloat(budget),
    })
  }

  const provinces = [
    'Banteay Meanchey',
    'Battambang',
    'Kampong Cham',
    'Kampong Chhnang',
    'Kampong Speu',
    'Kampong Thom',
    'Kampot',
    'Kandal',
    'Kep',
    'Koh Kong',
    'Kratié',
    'Mondulkiri',
    'Oddar Meanchey',
    'Pailin',
    'Phnom Penh',
    'Preah Vihear',
    'Prey Veng',
    'Pursat',
    'Ratanakiri',
    'Siem Reap',
    'Sihanoukville (Preah Sihanouk)',
    'Stung Treng',
    'Svay Rieng',
    'Takeo',
    'Tboung Khmum',
  ]

  return (
    <div className="quiz-page">
      <div className="quiz-page__backdrop" onClick={onClose} />
      <div className="quiz-page__modal" role="dialog" aria-modal="true" aria-labelledby="quiz-page-title">
        <div className="quiz-page__header">
          <h2 id="quiz-page-title">Required info</h2>
          <button type="button" className="quiz-page__close" onClick={onClose} aria-label="Close quiz popup">
            ✕
          </button>
        </div>

        <form ref={formRef} className="quiz-page__form" onSubmit={handleSubmit}>
          <div className="quiz-page__field">
            <label htmlFor="province">1. What province are you traveling to?</label>
            <select id="province" name="province" required>
              <option value="">Select a province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="quiz-page__field">
            <label htmlFor="days">2. How many days are you traveling?</label>
            <input id="days" name="days" type="number" min="1" step="1" placeholder="Enter number of days" required />
          </div>

          <div className="quiz-page__field">
            <label htmlFor="budget">3. What's your total estimated budget?</label>
            <input
              id="budget"
              name="budget"
              type="number"
              min="20"
              max="10000"
              step="1"
              placeholder="$20 - $10000"
              required
            />
          </div>

          <button type="submit" className="button button--primary">
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuizRequiedPopup