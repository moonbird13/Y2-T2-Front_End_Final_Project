import { useState } from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import FavouriteTab from './components/FavouriteTab'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import QuizPage from './components/QuizPage'
import QuizRequiedPopup from './components/QuizRequiedPopup'
import RecommendedPage from './components/RecommendedPage'
import Sidebar from './components/Sidebar'
import StartQuizButton from './components/StartQuizButton'
import { carouselSlides } from './data/carouselSlides'
import { resolveRecommendedProvince } from './data/quizQuestions'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [showQuizPage, setShowQuizPage] = useState(false)
  const [showRecommendedPage, setShowRecommendedPage] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [showFavouriteTab, setShowFavouriteTab] = useState(false)

  const hasRecommendationResult = Boolean(quizAnswers)
  const currentView = showFavouriteTab ? 'favourite' : showRecommendedPage ? 'recommendation' : 'hero'

  const handleAuthenticate = (authUser) => {
    setUser(authUser)
  }

  const handleAddFavorite = (item) => {
    if (!user) {
      setAuthOpen(true)
      return
    }

    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === item.id && fav.category === item.category)
      if (exists) {
        return prev.filter(fav => !(fav.id === item.id && fav.category === item.category))
      }
      return [...prev, { ...item, category: item.category }]
    })
  }

  const handleRemoveFavorite = (item) => {
    setFavorites(prev => prev.filter(fav => !(fav.id === item.id && fav.category === item.category)))
  }

  const handleGoFavouriteTab = () => {
    setShowFavouriteTab(true)
    setShowRecommendedPage(false)
  }

  const handleCloseFavouriteTab = () => {
    setShowFavouriteTab(false)
  }

  const handleLogout = () => {
    setUser(null)
    setAuthOpen(false)
  }

  const handleStartQuiz = () => {
    setQuizOpen(true)
  }

  const handleQuizContinue = (data) => {
    setQuizData(data)
    setQuizOpen(false)
    setShowQuizPage(true)
  }

  const handleQuizClose = () => {
    setShowQuizPage(false)
    setQuizData(null)
  }

  const handleQuizComplete = (answers) => {
    const selectedProvince = String(quizData?.province || '').trim()
    const isRecommendMe = ['recommend me', 'recommand me'].includes(selectedProvince.toLowerCase())
    const resolvedProvince = isRecommendMe ? resolveRecommendedProvince(answers) || 'Siem Reap' : selectedProvince

    const completeAnswers = {
      ...answers,
      province: resolvedProvince || 'Siem Reap',
      days: quizData?.days || 3,
      budget: quizData?.budget || 1000,
      requestedProvince: selectedProvince,
    }

    setShowQuizPage(false)
    setShowRecommendedPage(true)
    setQuizAnswers(completeAnswers)
    console.log('Quiz completed with answers:', completeAnswers)
  }

  const handleGoHomeFromMenu = () => {
    setShowRecommendedPage(false)
    setShowFavouriteTab(false)
  }

  const handleGoRecommendationFromMenu = () => {
    if (hasRecommendationResult) {
      setShowRecommendedPage(true)
      setShowFavouriteTab(false)
    }
  }

  return (
    <div className="app-shell">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onLoginClick={() => setAuthOpen(true)}
        onLogoutClick={handleLogout}
        isAuthenticated={Boolean(user)}
        user={user}
      />

      <main className="page">
        {showFavouriteTab ? (
          <FavouriteTab
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onClose={handleCloseFavouriteTab}
          />
        ) : showRecommendedPage ? (
          <RecommendedPage answers={quizAnswers} onAddFavorite={handleAddFavorite} favorites={favorites} />
        ) : (
          <section className="hero-grid">
            <div className="hero-copy">
              <h1>Make the most out of your trip even on a low budget</h1>
              <p className="hero-copy__description">
                Take a short quiz to get the best trip plan according to your budget and interest.
              </p>

              <div className="hero-copy__actions">
                <StartQuizButton onClick={handleStartQuiz} />
                {!user && (
                  <button type="button" className="button button--ghost" onClick={() => setAuthOpen(true)}>
                    Login
                  </button>
                )}
              </div>
            </div>

            <HeroCarousel slides={carouselSlides} />
          </section>
        )}
      </main>

      {quizOpen && <QuizRequiedPopup open={quizOpen} onClose={() => setQuizOpen(false)} onContinue={handleQuizContinue} />}

      {showQuizPage && <QuizPage province={quizData.province} onClose={handleQuizClose} onComplete={handleQuizComplete} />}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onGoHome={handleGoHomeFromMenu}
        onGoRecommendation={handleGoRecommendationFromMenu}
        onGoFavouriteTab={handleGoFavouriteTab}
        canGoRecommendation={hasRecommendationResult}
        currentView={currentView}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticate={handleAuthenticate}
      />
    </div>
  )
}

export default App
