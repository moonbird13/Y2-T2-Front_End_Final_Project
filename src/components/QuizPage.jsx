import { useState } from 'react'
import quizBackground from '../assets/Background.avif'
import { getQuizQuestions } from '../data/quizQuestions'

function QuizPage({ province, onClose }) {
  const quizQuestions = getQuizQuestions(province)
  const [currentQuestionId, setCurrentQuestionId] = useState(quizQuestions[0]?.id ?? 1)
  const [questionHistory, setQuestionHistory] = useState([])
  // Stores either a single answer id (string) or multiple ids (array) per question.
  const [selectedAnswers, setSelectedAnswers] = useState({})
  // Inline validation text shown under the active question.
  const [warningMessage, setWarningMessage] = useState('')
  // Toggles the shake animation when validation fails.
  const [isRattling, setIsRattling] = useState(false)

  const currentQuestion = quizQuestions.find((q) => q.id === currentQuestionId)
  const currentQuestionIndex = quizQuestions.findIndex((q) => q.id === currentQuestionId)

  // Supports selected state checks for both single-select and multi-select questions.
  const isSelected = (questionId, answerId) => {
    const value = selectedAnswers[questionId]
    return Array.isArray(value) ? value.includes(answerId) : value === answerId
  }

  const getSelectionCount = (value) => {
    return Array.isArray(value) ? value.length : value ? 1 : 0
  }

  const handleAnswerSelect = (answerId) => {
    // Questions without maxSelections default to single-select.
    const maxSelections = currentQuestion.maxSelections || 1

    if (warningMessage) {
      setWarningMessage('')
    }

    setSelectedAnswers((prev) => {
      const currentValue = prev[currentQuestion.id]

      if (maxSelections > 1) {
        // For multi-select questions, keep answers in an array.
        const selectedList = Array.isArray(currentValue) ? currentValue : []

        if (selectedList.includes(answerId)) {
          return {
            ...prev,
            [currentQuestion.id]: selectedList.filter((id) => id !== answerId),
          }
        }

        if (selectedList.length >= maxSelections) {
          // Ignore extra clicks once the question reaches its selection limit.
          return prev
        }

        return {
          ...prev,
          [currentQuestion.id]: [...selectedList, answerId],
        }
      }

      return {
        ...prev,
        [currentQuestion.id]: answerId,
      }
    })
  }

  const handleNext = () => {
    const currentValue = selectedAnswers[currentQuestion.id]
    // Some questions require more than one selected option (for example minSelections = 2).
    const requiredSelections = currentQuestion.minSelections || 1
    const currentSelectionCount = getSelectionCount(currentValue)
    const hasEnoughSelections = currentSelectionCount >= requiredSelections

    if (!hasEnoughSelections) {
      // Show feedback near the question and animate the container.
      setWarningMessage(currentSelectionCount === 0 ? 'Please choose an option' : 'Please choose another option')
      setIsRattling(true)
      setTimeout(() => setIsRattling(false), 360)
      return
    }

    if (warningMessage) {
      setWarningMessage('')
    }

    const nextId = currentQuestion.nextQuestion
    const hasNextQuestion = quizQuestions.some((question) => question.id === nextId)

    if (nextId && hasNextQuestion) {
      setQuestionHistory((prev) => [...prev, currentQuestion.id])
      setCurrentQuestionId(nextId)
    }
  }

  const handlePrev = () => {
    if (questionHistory.length > 0) {
      const previousQuestionId = questionHistory[questionHistory.length - 1]
      setQuestionHistory((prev) => prev.slice(0, -1))
      setCurrentQuestionId(previousQuestionId)
    }
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div
      className="quiz-page-main"
      style={{
        backgroundImage: `linear-gradient(rgba(45, 55, 72, 0.32), rgba(45, 55, 72, 0.32)), url('${quizBackground}')`,
      }}
    >
      <button type="button" className="quiz-page-main__close" onClick={onClose} aria-label="Exit quiz">
        ✕
      </button>

      <div className={`quiz-page-main__container ${isRattling ? 'quiz-page-main__container--shake' : ''}`}>
        {/* Q2 shows different text depending on who the user travels with in Q1. */}
        {currentQuestion.id === 2 && selectedAnswers[1] ? (
          <h2 className="quiz-page-main__question">
            {selectedAnswers[1] === 'solo' ? currentQuestion.questionSolo : currentQuestion.questionGroup}
          </h2>
        ) : (
          <h2 className="quiz-page-main__question">{currentQuestion.question}</h2>
        )}
        {warningMessage && <p className="quiz-page-main__warning">{warningMessage}</p>}

        <div className="quiz-page-main__answers">
          {/* Q2 also swaps answer sets based on the Q1 selection. */}
          {currentQuestion.id === 2 && selectedAnswers[1] ? (
            <>
              {(selectedAnswers[1] === 'solo' ? currentQuestion.answersSolo : currentQuestion.answersGroup).map((answer) => (
                <button
                  key={answer.id}
                  type="button"
                  className={`quiz-page-main__answer ${isSelected(currentQuestion.id, answer.id) ? 'quiz-page-main__answer--selected' : ''}`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  <img src={answer.image} alt={answer.label} className="quiz-page-main__answer-image" />
                  <div className="quiz-page-main__answer-label">{answer.label}</div>
                </button>
              ))}
            </>
          ) : (
            <>
              {currentQuestion.answers?.map((answer) => (
                <button
                  key={answer.id}
                  type="button"
                  className={`quiz-page-main__answer ${isSelected(currentQuestion.id, answer.id) ? 'quiz-page-main__answer--selected' : ''}`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  <img src={answer.image} alt={answer.label} className="quiz-page-main__answer-image" />
                  <div className="quiz-page-main__answer-label">{answer.label}</div>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="quiz-page-main__navigation">
          <button
            type="button"
            className="quiz-page-main__nav-btn"
            onClick={handlePrev}
            disabled={questionHistory.length === 0}
            aria-label="Previous question"
          >
            ◀
          </button>

          <span className="quiz-page-main__progress">
            {currentQuestionIndex + 1} / {quizQuestions.length}
          </span>

          <button
            type="button"
            className="quiz-page-main__nav-btn"
            onClick={handleNext}
            disabled={currentQuestion.nextQuestion === null}
            aria-label="Next question"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizPage
