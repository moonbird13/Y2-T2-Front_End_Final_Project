function Header({ onMenuClick, onLoginClick, onLogoutClick, isAuthenticated, userName }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="icon-button"
          onClick={onMenuClick}
          aria-label="Open support sidebar"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="topbar__brand">
        <span className="topbar__dot" aria-hidden="true" />
        <span className="topbar__title">Komrong Trip</span>
      </div>

      <div className="topbar__actions">
        {isAuthenticated ? (
          <>
            <span className="topbar__status">Signed in as {userName}</span>
            <button type="button" className="button button--ghost" onClick={onLogoutClick}>
              Logout
            </button>
          </>
        ) : (
          <button type="button" className="button button--ghost" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
