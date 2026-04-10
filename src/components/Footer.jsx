export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          © {new Date().getFullYear()} MindCare. All rights reserved. Your mental health matters.
        </p>
        <div className="footer-links">
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <a href="#terms" className="footer-link">Terms of Service</a>
          <a href="mailto:help@mindcare.com" className="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  );
}
