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
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64 data URL for local storage / preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAboutForm(prev => ({ ...prev, profileImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Field configuration for the about editor
  const aboutFields = [
    { key: 'name', label: '👤 Counsellor Name', type: 'text', placeholder: 'Dr. Sarah Mitchell' },
    { key: 'title', label: '🎓 Professional Title', type: 'text', placeholder: 'Licensed Mental Health Counselor' },
    { key: 'profileImage', label: '📷 Profile Picture', type: 'image' },
    { key: 'bio', label: '📝 Bio / About', type: 'textarea', placeholder: 'Tell patients about yourself...' },
    { key: 'credentials', label: '🏅 Credentials', type: 'text', placeholder: 'PhD, Licensed MHC, CBT Certified (comma-separated)', hint: 'Separate with commas' },
    { key: 'approach', label: '💡 Therapeutic Approach', type: 'textarea', placeholder: 'Describe your approach...' },
    { key: 'email', label: '📧 Contact Email', type: 'text', placeholder: 'your@email.com' },
    { key: 'phone', label: '📞 Phone Number', type: 'text', placeholder: '+1-555-0000' },
    { key: 'whatsapp', label: '💬 WhatsApp Link', type: 'text', placeholder: 'https://wa.me/yourphonenumber', hint: 'Format: https://wa.me/91XXXXXXXXXX (country code + number, no spaces or dashes)' },
  ];

  return (
    <div className="dashboard container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Doctor'}</span> 👋</h1>
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
        {['overview', 'profile'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab === 'overview' ? '📋 Overview' : '👩‍⚕️ Edit Profile & About'}
          </button>
        ))}
      </div>

      {/* Save success toast */}
      {saveSuccess && (
        <div className="toast toast-success animate-fade-in-up">
          ✅ Profile saved successfully!
        </div>
      )}

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
                onClick={() => setActiveTab('profile')}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✏️</div>
                <h4>Edit Profile</h4>
                <p style={{ fontSize: 'var(--text-sm)' }}>Update name, photo, about & WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="animate-fade-in">
          {/* Profile Preview Card */}
          <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
              <h3>📋 Profile Preview <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(how patients see you)</span></h3>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Profile Image Preview */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: 'var(--radius-2xl)',
                overflow: 'hidden',
                border: '3px solid var(--color-accent-primary)',
                boxShadow: 'var(--shadow-glow)',
                flexShrink: 0,
              }}>
                <img
                  src={about?.profileImage || '/counselor.png'}
                  alt={about?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/favicon.svg'; }}
                />
              </div>

              <div>
                <h2 style={{ marginBottom: 'var(--space-1)' }}>{about?.name}</h2>
                <p style={{ color: 'var(--color-accent-secondary)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                  {about?.title}
                </p>
                <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                  {about?.email && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>📧 {about.email}</span>
                  )}
                  {about?.phone && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>📞 {about.phone}</span>
                  )}
                  {about?.whatsapp && (
                    <a href={about.whatsapp} target="_blank" rel="noreferrer" style={{
                      fontSize: 'var(--text-xs)',
                      color: '#25D366',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
              <h3>{editingAbout ? '✏️ Editing Profile' : '👩‍⚕️ Profile Details'}</h3>
              {!editingAbout ? (
                <button className="btn btn-primary btn-sm" onClick={() => setEditingAbout(true)} id="edit-about-btn">
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditingAbout(false); setAboutForm(about); }}>
                    Cancel
                  </button>
                  <button className="btn btn-success btn-sm" onClick={handleSaveAbout} id="save-about-btn">
                    ✔ Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="about-editor">
              {aboutFields.map(field => (
                <div key={field.key} className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">{field.label}</label>

                  {/* Image upload field */}
                  {field.type === 'image' ? (
                    editingAbout ? (
                      <div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            border: '2px solid var(--color-border)',
                            flexShrink: 0,
                          }}>
                            <img
                              src={aboutForm.profileImage || '/counselor.png'}
                              alt="Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/favicon.svg'; }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              id="profile-image-upload"
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="profile-image-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                              📷 Upload New Photo
                            </label>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
                              Or paste an image URL:
                            </p>
                            <input
                              className="form-input"
                              value={aboutForm.profileImage || ''}
                              onChange={e => setAboutForm(prev => ({ ...prev, profileImage: e.target.value }))}
                              placeholder="https://example.com/photo.jpg"
                              style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          border: '2px solid var(--color-border)',
                        }}>
                          <img
                            src={about?.profileImage || '/counselor.png'}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                          />
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                          Current profile photo
                        </span>
                      </div>
                    )
                  ) : field.type === 'textarea' ? (
                    editingAbout ? (
                      <textarea
                        className="form-textarea"
                        value={aboutForm[field.key] || ''}
                        onChange={e => setAboutForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={4}
                      />
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                        {about?.[field.key] || '—'}
                      </p>
                    )
                  ) : (
                    editingAbout ? (
                      <div>
                        <input
                          className="form-input"
                          value={aboutForm[field.key] || ''}
                          onChange={e => setAboutForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                        {field.hint && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
                            💡 {field.hint}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        {field.key === 'whatsapp' && about?.[field.key] ? (
                          <a href={about[field.key]} target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>
                            💬 {about[field.key]}
                          </a>
                        ) : (
                          about?.[field.key] || '—'
                        )}
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
