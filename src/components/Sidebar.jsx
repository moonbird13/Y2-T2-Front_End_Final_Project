function Sidebar({ open, onClose, onGoHome, onGoRecommendation, canGoRecommendation, currentView }) {
  return (
    <>
      <div
        className={`sidebar-overlay${open ? ' sidebar-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2>Support</h2>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="sidebar__text">
          Need help planning a trip? Reach out here and we will wire the real support flow later.
        </p>

        <nav className="sidebar__nav" aria-label="App navigation links">
          <button
            type="button"
            className="sidebar__action"
            onClick={() => {
              onGoHome()
              onClose()
            }}
            disabled={currentView === 'hero'}
          >
            Go To Hero Page
          </button>

          <button
            type="button"
            className="sidebar__action"
            onClick={() => {
              onGoRecommendation()
              onClose()
            }}
            disabled={!canGoRecommendation || currentView === 'recommendation'}
          >
            Go To Recommendation Page
          </button>

          <a href="#contact">Contact us</a>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
