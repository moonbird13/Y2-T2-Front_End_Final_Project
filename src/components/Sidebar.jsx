function Sidebar({ open, onClose }) {
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

        <nav className="sidebar__nav" aria-label="Support links">
          <a href="#support-email">Email support</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact us</a>
        </nav>

        <div className="sidebar__card" id="support-email">
          <strong>Support email</strong>
          <span>support@komrongtrip.com</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
