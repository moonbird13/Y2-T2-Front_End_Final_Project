import { useEffect, useState } from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import FavouriteTab from './components/FavouriteTab'
import Footer from './components/Footer'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import HistoryTab from './components/HistoryTab'
import QuizPage from './components/QuizPage'
import QuizRequiedPopup from './components/QuizRequiedPopup'
import RecommendedPage from './components/RecommendedPage'
import Sidebar from './components/Sidebar'
import StartQuizButton from './components/StartQuizButton'
import { carouselSlides } from './data/carouselSlides'
import { resolveRecommendedProvince } from './data/quizQuestions'

const STORAGE_KEYS = {
  user: 'komrongtrip.user',
  favorites: 'komrongtrip.favorites',
  history: 'komrongtrip.history',
}

const favoritesKeyFor = (email) => `komrongtrip.favorites_${email}`
const historyKeyFor = (email) => `komrongtrip.history_${email}`

const getStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Ignore storage errors on private mode or quota issues.
  }
}

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
  const [recommendationHistory, setRecommendationHistory] = useState([])
  const [showFavouriteTab, setShowFavouriteTab] = useState(false)
  const [showHistoryTab, setShowHistoryTab] = useState(false)

  useEffect(() => {
    const storedUser = getStorage(STORAGE_KEYS.user, null)
    if (storedUser) {
      setUser(storedUser)
      setFavorites(getStorage(favoritesKeyFor(storedUser.email), []))
      setRecommendationHistory(getStorage(historyKeyFor(storedUser.email), []))
    } else {
      setFavorites(getStorage(STORAGE_KEYS.favorites, []))
      setRecommendationHistory(getStorage(STORAGE_KEYS.history, []))
    }
  }, [])

  useEffect(() => {
    if (user) {
      setStorage(STORAGE_KEYS.user, user)
      setStorage(favoritesKeyFor(user.email), favorites)
      setStorage(historyKeyFor(user.email), recommendationHistory)
    } else {
      localStorage.removeItem(STORAGE_KEYS.user)
      setStorage(STORAGE_KEYS.favorites, favorites)
      setStorage(STORAGE_KEYS.history, recommendationHistory)
    }
  }, [favorites, recommendationHistory, user])

  useEffect(() => {
    if (user) {
      setFavorites(getStorage(favoritesKeyFor(user.email), []))
      setRecommendationHistory(getStorage(historyKeyFor(user.email), []))
    }
  }, [user?.email])

  const hasRecommendationResult = Boolean(quizAnswers)
  const currentView = showHistoryTab ? 'history' : showFavouriteTab ? 'favourite' : showRecommendedPage ? 'recommendation' : 'home'

  const handleAuthenticate = (authUser) => {
    setUser(authUser)
  }

  const handleAddFavorite = (item) => {
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

  const handleOpenFavorites = () => {
    setShowFavouriteTab(true)
    setShowRecommendedPage(false)
    setShowHistoryTab(false)
  }

  const handleCloseFavouriteTab = () => {
    setShowFavouriteTab(false)
  }

  const handleOpenHistory = () => {
    setShowHistoryTab(true)
    setShowFavouriteTab(false)
    setShowRecommendedPage(false)
  }

  const handleCloseHistoryTab = () => {
    setShowHistoryTab(false)
  }

  const handleLogout = () => {
    setUser(null)
    setAuthOpen(false)
    setFavorites(getStorage(STORAGE_KEYS.favorites, []))
    setRecommendationHistory(getStorage(STORAGE_KEYS.history, []))
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
    setRecommendationHistory((prev) => [...prev, { ...completeAnswers, timestamp: Date.now() }])
    console.log('Quiz completed with answers:', completeAnswers)
  }

  const handleGoHomeFromMenu = () => {
    setShowRecommendedPage(false)
    setShowFavouriteTab(false)
    setShowHistoryTab(false)
  }

  const handleGoRecommendationFromMenu = () => {
    if (hasRecommendationResult) {
      setShowRecommendedPage(true)
      setShowFavouriteTab(false)
      setShowHistoryTab(false)
    }
  }

  return (
    <div className="app-shell">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onLoginClick={() => setAuthOpen(true)}
        onLogoutClick={handleLogout}
        onShowFavorites={handleOpenFavorites}
        onShowHistory={handleOpenHistory}
        isAuthenticated={Boolean(user)}
        user={user}
      />

      <main className="page">
        {showHistoryTab ? (
          <HistoryTab
            history={recommendationHistory}
            onClose={handleCloseHistoryTab}
          />
        ) : showFavouriteTab ? (
          <FavouriteTab
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onClose={handleCloseFavouriteTab}
          />
        ) : showRecommendedPage ? (
          <RecommendedPage answers={quizAnswers} onAddFavorite={handleAddFavorite} favorites={favorites} />
        ) : (
          <section className="home-grid">
            <div className="home-copy">
              <h1>Travel smarter on any budget</h1>
              <p className="home-copy__description">
                Take a quick quiz to get a tailored trip plan based on your budget, interests, and travel style.
              </p>

              <div className="home-copy__actions">
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

      <Footer />
    </div>
  )
}

export default App
