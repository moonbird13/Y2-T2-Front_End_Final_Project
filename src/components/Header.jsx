import { useState } from 'react'
import AccountPopup from './AccountPopup'

function Header({ onMenuClick, onLoginClick, onLogoutClick, onShowFavorites, onShowHistory, isAuthenticated, user }) {
  const [popupOpen, setPopupOpen] = useState(false)
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
          <div className="topbar__user">
            <button
              type="button"
              className="user-avatar"
              onClick={() => setPopupOpen(!popupOpen)}
              aria-label="Open account menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
            {popupOpen && (
              <AccountPopup
                user={user}
                onLogout={() => {
                  onLogoutClick()
                  setPopupOpen(false)
                }}
                onShowFavorites={() => {
                  onShowFavorites()
                  setPopupOpen(false)
                }}
                onShowHistory={() => {
                  onShowHistory()
                  setPopupOpen(false)
                }}
                onClose={() => setPopupOpen(false)}
              />
            )}
          </div>
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
