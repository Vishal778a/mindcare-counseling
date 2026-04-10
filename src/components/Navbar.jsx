import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  // Don't show navbar on session page
  if (location.pathname.startsWith('/session')) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/favicon.svg" alt="MindCare" className="navbar-logo" />
          <span className="navbar-title">MindCare</span>
        </Link>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-mobile-toggle"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>About</Link></li>

          {!isAuthenticated && (
            <li>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </li>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <li><Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/patients" className={isActive('/patients')} onClick={() => setMenuOpen(false)}>Patients</Link></li>
              <li><Link to="/appointments" className={isActive('/appointments')} onClick={() => setMenuOpen(false)}>Appointments</Link></li>
            </>
          )}

          {isAuthenticated && !isAdmin && (
            <>
              <li><Link to="/patient/dashboard" className={isActive('/patient/dashboard')} onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/patient/book" className={isActive('/patient/book')} onClick={() => setMenuOpen(false)}>Book Session</Link></li>
              <li><Link to="/feedback" className={isActive('/feedback')} onClick={() => setMenuOpen(false)}>Feedback</Link></li>
            </>
          )}

          {isAuthenticated && (
            <li className="navbar-user">
              <div className="navbar-avatar" style={{
                background: 'var(--color-accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
              }}>
                {user?.name?.charAt(0) || '?'}
              </div>
              <span className="navbar-user-name hide-mobile">{user?.name?.split(' ')[0]}</span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => { logout(); setMenuOpen(false); }}
                id="nav-logout-btn"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
