import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutForm, setAboutForm] = useState({});

  useEffect(() => {
    Promise.all([
      mockApi.getPatients(),
      mockApi.getAppointments(),
      mockApi.getAbout(),
    ]).then(([p, a, ab]) => {
      setPatients(p);
      setAppointments(a);
      setAbout(ab);
      setAboutForm(ab);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const activePatients = patients.filter(p => p.status === 'active').length;
  const blockedPatients = patients.filter(p => p.status === 'blocked').length;
  const upcomingAppts = appointments.filter(a => a.status === 'scheduled').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;

  const todayAppointments = appointments.filter(a => {
    if (a.status !== 'scheduled') return false;
    const d = new Date(a.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString() ||
      (d > now && d - now < 2 * 24 * 60 * 60 * 1000);
  });

  const handleSaveAbout = () => {
    mockApi.updateAbout(aboutForm).then((updated) => {
      setAbout(updated);
      setEditingAbout(false);
    });
  };

  return (
    <div className="dashboard container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p>Here&apos;s an overview of your practice today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '👥', value: patients.length, label: 'Total Patients', color: '#6366f1' },
          { icon: '✅', value: activePatients, label: 'Active Patients', color: '#34d399' },
          { icon: '📅', value: upcomingAppts, label: 'Upcoming Sessions', color: '#60a5fa' },
          { icon: '✔️', value: completedAppts, label: 'Completed', color: '#fbbf24' },
        ].map((stat, i) => (
          <div key={i} className={`card stat-card animate-fade-in-up delay-${i + 1}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'about'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab === 'overview' ? '📋 Overview' : '📝 About Section'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {/* Upcoming Appointments */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3>Upcoming Sessions</h3>
              <Link to="/appointments" className="btn btn-outline btn-sm">View All →</Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="card empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">📭</div>
                <h3>No upcoming sessions</h3>
                <p>Your schedule is clear for now.</p>
              </div>
            ) : (
              <div className="flex-col gap-3">
                {todayAppointments.slice(0, 5).map(appt => (
                  <div key={appt.id} className="card appointment-card">
                    <div className="appointment-time">
                      <span className="time">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="date">
                        {new Date(appt.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="appointment-info">
                      <h4>{appt.patientName}</h4>
                      <p>{appt.patientEmail}</p>
                    </div>
                    <span className={`badge badge-${appt.type}`}>
                      {appt.type === 'video' ? '🎥' : '🎤'} {appt.type}
                    </span>
                    <div className="appointment-actions">
                      <Link to={`/session/${appt.id}`} className="btn btn-primary btn-sm">
                        Join →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
            <div className="grid grid-3">
              <Link to="/patients" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>👥</div>
                <h4>Manage Patients</h4>
                <p style={{ fontSize: 'var(--text-sm)' }}>View, block, or manage patients</p>
              </Link>
              <Link to="/appointments" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>📅</div>
                <h4>Appointments</h4>
                <p style={{ fontSize: 'var(--text-sm)' }}>View all scheduled sessions</p>
              </Link>
              <div className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--space-8)', cursor: 'pointer' }}
                onClick={() => setActiveTab('about')}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✏️</div>
                <h4>Edit About</h4>
                <p style={{ fontSize: 'var(--text-sm)' }}>Update your profile information</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="card animate-fade-in" style={{ padding: 'var(--space-8)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
            <h3>About Section</h3>
            {!editingAbout ? (
              <button className="btn btn-primary btn-sm" onClick={() => setEditingAbout(true)} id="edit-about-btn">
                ✏️ Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingAbout(false); setAboutForm(about); }}>
                  Cancel
                </button>
                <button className="btn btn-success btn-sm" onClick={handleSaveAbout} id="save-about-btn">
                  ✔ Save
                </button>
              </div>
            )}
          </div>

          {!editingAbout ? (
            <div className="about-editor">
              {Object.entries(about).map(([key, val]) => (
                <div key={key}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  <p>{val}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="about-editor">
              {Object.entries(aboutForm).map(([key, val]) => (
                <div key={key} className="form-group">
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  {key === 'bio' || key === 'approach' ? (
                    <textarea
                      className="form-textarea"
                      value={val}
                      onChange={e => setAboutForm(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="form-input"
                      value={val}
                      onChange={e => setAboutForm(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
