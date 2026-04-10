import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../services/api';

export default function LandingPage() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    mockApi.getAbout().then(setAbout);
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge animate-fade-in-down">
              ✦ Professional Mental Health Care
            </span>
            <h1 className="hero-title animate-fade-in-up delay-1">
              Your Journey to{' '}
              <span className="text-gradient">Better Mental Health</span>{' '}
              Starts Here
            </h1>
            <p className="hero-subtitle animate-fade-in-up delay-2">
              {about?.bio || 'Compassionate, evidence-based counseling in a safe and supportive environment. Take the first step toward healing today.'}
            </p>
            <div className="hero-actions animate-fade-in-up delay-3">
              <Link to="/login" className="btn btn-primary btn-lg" id="hero-get-started">
                Book a Session →
              </Link>
              <a href="#about" className="btn btn-outline btn-lg">Learn More</a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-float-card">
                <div className="hero-card-icon purple">🧠</div>
                <div className="hero-card-info">
                  <h4>Cognitive Behavioral Therapy</h4>
                  <p>Evidence-based approach for lasting change</p>
                </div>
              </div>
              <div className="hero-float-card">
                <div className="hero-card-icon green">🎥</div>
                <div className="hero-card-info">
                  <h4>Video & Voice Sessions</h4>
                  <p>Connect from anywhere, anytime</p>
                </div>
              </div>
              <div className="hero-float-card">
                <div className="hero-card-icon amber">🔒</div>
                <div className="hero-card-info">
                  <h4>100% Confidential</h4>
                  <p>Your privacy is our top priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="features-header animate-fade-in-up">
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Getting started is simple. We&apos;ve designed every step to be easy and comfortable.</p>
          </div>

          <div className="grid grid-4">
            {[
              { icon: '📝', title: 'Enroll', desc: 'Create your free account in under a minute' },
              { icon: '📅', title: 'Book', desc: 'Choose a time slot that works best for you' },
              { icon: '💬', title: 'Connect', desc: 'Join your session via video or voice call' },
              { icon: '🌱', title: 'Grow', desc: 'Build strategies for lasting mental wellness' },
            ].map((f, i) => (
              <div key={i} className={`card card-interactive feature-card animate-fade-in-up delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-image-wrapper animate-fade-in-up">
              <div className="about-image" style={{
                background: 'var(--color-accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem',
              }}>
                👩‍⚕️
              </div>
            </div>
            <div className="about-details animate-fade-in-up delay-2">
              <span className="hero-badge">✦ About Your Counselor</span>
              <h2>{about?.name || 'Dr. Sarah Mitchell'}</h2>
              <p style={{ color: 'var(--color-accent-secondary)', fontWeight: 500 }}>
                {about?.title || 'Licensed Mental Health Counselor'}
              </p>
              <p>{about?.bio || 'Loading...'}</p>
              <p>{about?.approach || ''}</p>
              <div className="about-credentials">
                {(about?.credentials || 'PhD Clinical Psychology, Licensed MHC, CBT Certified, EMDR Trained')
                  .split(',')
                  .map((c, i) => (
                    <span key={i} className="credential-tag">{c.trim()}</span>
                  ))}
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Link to="/login" className="btn btn-primary btn-lg" id="about-book-btn">
                  Book Your First Session →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <div className="container container-narrow">
          <div className="card card-glass animate-fade-in-up" style={{ padding: 'var(--space-12)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
              Ready to <span className="text-gradient">Start Healing</span>?
            </h2>
            <p style={{ marginBottom: 'var(--space-8)', maxWidth: '500px', margin: '0 auto var(--space-8)' }}>
              Taking the first step is often the hardest part. You don&apos;t have to do it alone.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" id="cta-get-started">
              Get Started — It&apos;s Free →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
