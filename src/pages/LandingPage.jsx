import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../services/api';

export default function LandingPage() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    mockApi.getAbout().then(data => setAbout(data));
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">🌟 Professional Mental Health Support</div>
            <h1>
              Your Journey to <span className="text-gradient">Better Mental Health</span> Starts Here
            </h1>
            <p className="hero-subtitle">
              A safe, confidential space for healing and growth. Connect with a licensed counselor
              through secure video sessions, at your convenience.
            </p>
            <div className="hero-cta">
              <Link to="/login" className="btn btn-primary btn-lg" id="hero-get-started">
                Get Started →
              </Link>
              <a href="#about" className="btn btn-outline btn-lg" id="hero-learn-more">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Four simple steps to begin your mental health journey</p>
          </div>

          <div className="features-grid">
            {[
              { icon: '📝', title: 'Enroll', desc: 'Create your profile and join the MindCare community securely.' },
              { icon: '📅', title: 'Book', desc: 'Choose a convenient time slot from the interactive calendar.' },
              { icon: '🎥', title: 'Connect', desc: 'Join your counseling session via secure video or voice call.' },
              { icon: '🌱', title: 'Grow', desc: 'Track your progress and continue your path to wellness.' },
            ].map((feature, i) => (
              <div key={i} className={`card card-feature animate-fade-in-up delay-${i + 1}`}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Counselor Profile */}
      <section className="section section-dark" id="about">
        <div className="container">
          <div className="section-header text-center">
            <h2>Meet Your <span className="text-gradient">Counselor</span></h2>
            <p>Professional, compassionate, and dedicated to your well-being</p>
          </div>

          {about && (
            <div className="counselor-profile animate-fade-in-up delay-1">
              <div className="counselor-card">
                {/* Profile Image */}
                <div className="counselor-image-wrapper">
                  <div className="counselor-image">
                    <img
                      src={about.profileImage || '/counselor.png'}
                      alt={about.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  {/* Decorative ring */}
                  <div className="counselor-image-ring"></div>
                </div>

                {/* Info */}
                <div className="counselor-info">
                  <h3 className="counselor-name">{about.name}</h3>
                  <p className="counselor-title">{about.title}</p>

                  {/* Credentials chips */}
                  {about.credentials && (
                    <div className="credentials-list">
                      {about.credentials.split(',').map((cred, i) => (
                        <span key={i} className="credential-badge">{cred.trim()}</span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="counselor-bio">{about.bio}</p>

                  {/* Approach */}
                  {about.approach && (
                    <div className="counselor-approach">
                      <h4>My Approach</h4>
                      <p>{about.approach}</p>
                    </div>
                  )}

                  {/* Contact Row */}
                  <div className="counselor-contact">
                    {about.email && (
                      <a href={`mailto:${about.email}`} className="contact-link">
                        <span className="contact-icon">📧</span>
                        {about.email}
                      </a>
                    )}
                    {about.phone && (
                      <a href={`tel:${about.phone}`} className="contact-link">
                        <span className="contact-icon">📞</span>
                        {about.phone}
                      </a>
                    )}
                    {about.whatsapp && (
                      <a href={about.whatsapp} target="_blank" rel="noreferrer" className="contact-link whatsapp-link">
                        <span className="contact-icon">💬</span>
                        WhatsApp
                      </a>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="counselor-cta">
                    <Link to="/login" className="btn btn-primary btn-lg">
                      Book a Session →
                    </Link>
                    {about.whatsapp && (
                      <a href={about.whatsapp} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                        💬 Chat on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="section" id="trust">
        <div className="container text-center">
          <div className="section-header">
            <h2>Why <span className="text-gradient">MindCare</span>?</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: '🔒', title: 'Secure & Private', desc: 'End-to-end encrypted sessions. Your conversations are completely confidential.' },
              { icon: '💰', title: 'Affordable', desc: 'Quality mental health care at accessible prices. No hidden fees.' },
              { icon: '🕐', title: 'Flexible Scheduling', desc: 'Book sessions at times that work for you. Morning, afternoon, or evening.' },
              { icon: '❤️', title: 'Evidence-Based', desc: 'Proven therapeutic approaches tailored to your unique needs and goals.' },
            ].map((item, i) => (
              <div key={i} className={`card card-feature animate-fade-in-up delay-${i + 1}`}>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
