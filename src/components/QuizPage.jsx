import { useState } from 'react'
import quizBackground from '../assets/Background.avif'

const quizQuestions = [
  {
    id: 1,
    question: 'Who are you traveling with?',
    answers: [
      { id: 'solo', label: 'Solo', image: '👤' },
      { id: 'couple', label: 'Couple', image: '👥' },
      { id: 'friends', label: 'Friends', image: '👨‍👩‍👧‍👦' },
      { id: 'family', label: 'Family', image: '👪' },
    ],
  },
]

function QuizPage({ province, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})

  const question = quizQuestions[currentQuestion]

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [question.id]: answerId,
    })
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
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

      <div className="quiz-page-main__container">
        <h2 className="quiz-page-main__question">{question.question}</h2>

        <div className="quiz-page-main__answers">
          {question.answers.map((answer) => (
            <button
              key={answer.id}
              type="button"
              className={`quiz-page-main__answer ${selectedAnswers[question.id] === answer.id ? 'quiz-page-main__answer--selected' : ''}`}
              onClick={() => handleAnswerSelect(answer.id)}
            >
              <div className="quiz-page-main__answer-image">{answer.image}</div>
              <div className="quiz-page-main__answer-label">{answer.label}</div>
            </button>
          ))}
        </div>

        <div className="quiz-page-main__navigation">
          <button
            type="button"
            className="quiz-page-main__nav-btn"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            aria-label="Previous question"
          >
            ◀
          </button>

          <span className="quiz-page-main__progress">
            {currentQuestion + 1} / {quizQuestions.length}
          </span>

          <button
            type="button"
            className="quiz-page-main__nav-btn"
            onClick={handleNext}
            disabled={currentQuestion === quizQuestions.length - 1}
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
