function StartQuizButton() {
  const handleClick = () => {
    alert('Quiz Started!')
  }

  return (
    <button type="button" className="button button--quiz" onClick={handleClick}>
      Start quiz
    </button>
  )
}

export default StartQuizButton
