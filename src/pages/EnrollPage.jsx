import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/api';

export default function EnrollPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await mockApi.enrollPatient(form);
      setSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Enrollment failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="enroll-page container animate-fade-in">
        <div className="enroll-form">
          <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
            <h2>You&apos;re Enrolled!</h2>
            <p style={{ marginTop: 'var(--space-3)' }}>
              Welcome to MindCare. Redirecting to your dashboard...
            </p>
            <div className="spinner spinner-sm" style={{ margin: 'var(--space-4) auto 0' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enroll-page container animate-fade-in">
      <div className="enroll-form">
        <div className="card animate-scale-in" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}>📝</div>
            <h2>Enroll as a <span className="text-gradient">Patient</span></h2>
            <p>Fill in your details to get started with MindCare.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="enroll-name">Full Name</label>
                <input
                  id="enroll-name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="enroll-email">Email Address</label>
                <input
                  id="enroll-email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="enroll-phone">Phone Number</label>
                <input
                  id="enroll-phone"
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-555-0100"
                  required
                />
              </div>

              {error && (
                <div className="form-error" style={{ padding: 'var(--space-3)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)' }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                id="enroll-submit"
              >
                {submitting ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    Enrolling...
                  </>
                ) : (
                  'Enroll Now →'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
