function Footer() {
  const handleContactClick = () => {
    window.open('https://web.facebook.com/profile.php?id=61572333628193', '_blank')
  }

  return (
    <footer className="footer">
      <div className="footer__content">
        <button
          type="button"
          className="footer__contact"
          onClick={handleContactClick}
        >
          Contact Us
        </button>
        <p className="footer__text">
          © 2026 Komrong Trip. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer