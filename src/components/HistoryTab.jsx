import { useState } from 'react'

function HistoryTab({ history, onClose }) {
  const [sortBy, setSortBy] = useState('newest')

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.timestamp - a.timestamp
    }
    return a.timestamp - b.timestamp
  })

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="recommended-page">
      <button type="button" className="recommended-page__close" onClick={onClose} aria-label="Exit history">
        ✕
      </button>

      <div className="recommended-page__container">
        <h1>HISTORY TAB</h1>
        <p className="recommended-page__subtitle">YOUR QUIZ HISTORY</p>

        {/* Sort Options */}
        <div className="favorite-filter">
          <button
            type="button"
            className={`favorite-filter__button ${sortBy === 'newest' ? 'favorite-filter__button--active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Newest First
          </button>
          <button
            type="button"
            className={`favorite-filter__button ${sortBy === 'oldest' ? 'favorite-filter__button--active' : ''}`}
            onClick={() => setSortBy('oldest')}
          >
            Oldest First
          </button>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="favorites-empty">
            <p>No quiz history yet. Take your first quiz to get started!</p>
          </div>
        ) : (
          <div className="history-list">
            {sortedHistory.map((entry, index) => (
              <article key={entry.timestamp || index} className="history-entry">
                <div className="history-entry__header">
                  <h3>Quiz Result - {entry.province}</h3>
                  <span className="history-entry__date">{formatDate(entry.timestamp)}</span>
                </div>
                <div className="history-entry__details">
                  <div className="history-entry__item">
                    <strong>Days:</strong> {entry.days}
                  </div>
                  <div className="history-entry__item">
                    <strong>Budget:</strong> ${entry.budget}
                  </div>
                  <div className="history-entry__item">
                    <strong>Transport:</strong> {entry.transport || 'Not specified'}
                  </div>
                  <div className="history-entry__item">
                    <strong>Food Preferences:</strong> {entry.foodPreferences?.join(', ') || 'None'}
                  </div>
                  <div className="history-entry__item">
                    <strong>Allergies:</strong> {entry.allergies?.join(', ') || 'None'}
                  </div>
                  {entry.requestedProvince && entry.requestedProvince !== entry.province && (
                    <div className="history-entry__item">
                      <strong>Requested Province:</strong> {entry.requestedProvince}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryTab