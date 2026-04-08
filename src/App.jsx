import { useState } from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import Sidebar from './components/Sidebar'
import StartQuizButton from './components/StartQuizButton'
import { carouselSlides } from './data/carouselSlides'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)

  const handleAuthenticate = (authUser) => {
    setUser(authUser)
  }

  const handleLogout = () => {
    setUser(null)
    setAuthOpen(false)
  }

  return (
    <div className="app-shell">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onLoginClick={() => setAuthOpen(true)}
        onLogoutClick={handleLogout}
        isAuthenticated={Boolean(user)}
        userName={user?.name ?? ''}
      />

      <main className="page">
        <section className="hero-grid">
          <div className="hero-copy">
            <h1>Make the most out of your trip even on a low budget</h1>
            <p className="hero-copy__description">
              Take a short quiz to get the best trip plan according to your budget and interest.
            </p>

            <div className="hero-copy__actions">
              <StartQuizButton />
              {user ? (
                <button type="button" className="button button--ghost" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <button type="button" className="button button--ghost" onClick={() => setAuthOpen(true)}>
                  Login
                </button>
              )}
            </div>
          </div>

          <HeroCarousel slides={carouselSlides} />
        </section>
      </main>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticate={handleAuthenticate}
      />
    </div>
  )
}

export default App
