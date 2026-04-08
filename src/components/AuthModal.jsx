import { useState } from 'react'
import { getDefaultAccountsHint, loginAccount, signupAccount } from '../data/authStore'

function AuthModal({ open, onClose, onAuthenticate }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const defaultAccounts = getDefaultAccountsHint()

  if (!open) {
    return null
  }

  const resetForm = () => {
    setMode('login')
    setName('')
    setEmail('')
    setPassword('')
    setErrorMessage('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const authAction =
      mode === 'login'
        ? loginAccount({ email, password })
        : signupAccount({ name, email, password })

    if (!authAction.ok) {
      setErrorMessage(authAction.error)
      return
    }

    onAuthenticate(authAction.user)
    resetForm()
    onClose()
  }

  return (
    <div className="auth-modal" role="presentation">
      <button type="button" className="auth-modal__backdrop" onClick={handleClose} aria-label="Close login dialog" />

      <section className="auth-modal__panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-modal__header">
          <div>
            <p className="auth-modal__eyebrow">Komrong Trip</p>
            <h2 id="auth-title">{mode === 'login' ? 'Login' : 'Create account'}</h2>
          </div>
          <button type="button" className="button button--ghost" onClick={handleClose}>
            Close
          </button>
        </div>

        <div className="auth-modal__tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-modal__tab${mode === 'login' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setMode('login')
              setErrorMessage('')
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-modal__tab${mode === 'signup' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setMode('signup')
              setErrorMessage('')
            }}
          >
            Sign up
          </button>
        </div>

        <p className="auth-modal__hint">
          Default login: {defaultAccounts[0].email} / {defaultAccounts[0].password}
        </p>

        {errorMessage && <p className="auth-modal__error">{errorMessage}</p>}

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          <button type="submit" className="button button--primary auth-modal__submit">
            {mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AuthModal
