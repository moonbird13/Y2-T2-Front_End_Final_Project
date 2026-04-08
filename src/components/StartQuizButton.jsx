function StartQuizButton({ onClick }) {
  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <button type="button" className="button button--quiz" onClick={handleClick}>
      Start quiz
    </button>
  )
}

export default StartQuizButton
