import { useEffect, useRef } from 'react'

function AccountPopup({ user, onLogout, onClose }) {
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div ref={popupRef} className="account-popup">
      <div className="account-popup__info">
        <div className="account-popup__name">{user.name}</div>
        <div className="account-popup__email">{user.email}</div>
      </div>
      <button type="button" className="button button--ghost account-popup__logout" onClick={onLogout}>
        Logout
      </button>
    </div>
  )
}

export default AccountPopup