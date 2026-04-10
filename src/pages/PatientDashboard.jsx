import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(true);

  useEffect(() => {
    mockApi.getMyAppointments(user?.email || 'patient@example.com').then((a) => {
      setAppointments(a);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const upcoming = appointments.filter(a => a.status === 'scheduled');
  const past = appointments.filter(a => a.status === 'completed');

  return (
    <div className="dashboard container animate-fade-in">
      <div className="dashboard-header">
        <h1>Hello, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span> 👋</h1>
        <p>Your mental health journey is important. Here&apos;s what you have coming up.</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="card stat-card animate-fade-in-up delay-1">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">Upcoming Sessions</div>
        </div>
        <div className="card stat-card animate-fade-in-up delay-2">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{past.length}</div>
          <div className="stat-label">Completed Sessions</div>
        </div>
        <div className="card stat-card animate-fade-in-up delay-3">
          <div className="stat-icon">💚</div>
          <div className="stat-value">{enrolled ? 'Active' : '—'}</div>
          <div className="stat-label">Account Status</div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
          <h3>Your Upcoming Sessions</h3>
          <Link to="/patient/book" className="btn btn-primary btn-sm" id="book-new-session">
            + Book New Session
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🗓️</div>
            <h3>No upcoming sessions</h3>
            <p>Book your next session to continue your journey.</p>
            <Link to="/patient/book" className="btn btn-primary" id="empty-book-btn">
              Book a Session →
            </Link>
          </div>
        ) : (
          <div className="flex-col gap-3">
            {upcoming.map(appt => (
              <div key={appt.id} className="card appointment-card">
                <div className="appointment-time">
                  <span className="time">
                    {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="date">
                    {new Date(appt.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="appointment-info">
                  <h4>Session with Dr. Sarah Mitchell</h4>
                  <p>
                    {appt.type === 'video' ? '🎥 Video Call' : '🎤 Voice Call'}
                  </p>
                </div>
                <span className={`badge badge-${appt.type}`}>
                  {appt.type}
                </span>
                <div className="appointment-actions">
                  <Link to={`/session/${appt.id}`} className="btn btn-primary btn-sm">
                    Join →
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      mockApi.cancelAppointment(appt.id).then(() => {
                        setAppointments(prev => prev.map(a =>
                          a.id === appt.id ? { ...a, status: 'cancelled' } : a
                        ));
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Past Sessions</h3>
          <div className="flex-col gap-3">
            {past.map(appt => (
              <div key={appt.id} className="card appointment-card" style={{ opacity: 0.7 }}>
                <div className="appointment-time">
                  <span className="time">
                    {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="date">
                    {new Date(appt.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="appointment-info">
                  <h4>Session with Dr. Sarah Mitchell</h4>
                  <p>{appt.type === 'video' ? '🎥 Video Call' : '🎤 Voice Call'}</p>
                </div>
                <span className="badge badge-active">Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Quick Links</h3>
        <div className="grid grid-3">
          <Link to="/patient/book" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📅</div>
            <h4>Book Session</h4>
          </Link>
          <Link to="/feedback" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💬</div>
            <h4>Give Feedback</h4>
          </Link>
          <Link to="/" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>👩‍⚕️</div>
            <h4>About Counselor</h4>
          </Link>
        </div>
      </div>
    </div>
  );
}
