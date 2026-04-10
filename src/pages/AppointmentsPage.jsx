import { useState, useEffect } from 'react';
import { mockApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('scheduled');

  useEffect(() => {
    mockApi.getAppointments().then(a => {
      setAppointments(a);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading appointments..." />;

  const filtered = appointments.filter(a =>
    filter === 'all' ? true : a.status === filter
  );

  const handleCancel = (id) => {
    mockApi.cancelAppointment(id).then(() => {
      setAppointments(prev => prev.map(a =>
        a.id === id ? { ...a, status: 'cancelled' } : a
      ));
    });
  };

  return (
    <div className="container page-wrapper animate-fade-in">
      <div className="dashboard-header">
        <h1>All <span className="text-gradient">Appointments</span></h1>
        <p>View and manage all patient appointments.</p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ display: 'inline-flex', marginBottom: 'var(--space-6)' }}>
        {['scheduled', 'completed', 'cancelled', 'all'].map(f => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}({f === 'all'
              ? appointments.length
              : appointments.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No {filter} appointments</h3>
          <p>There are no appointments matching this filter.</p>
        </div>
      ) : (
        <div className="data-table-wrapper animate-fade-in-up">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                .map(appt => {
                  const schedDate = new Date(appt.scheduledAt);
                  const isPast = schedDate < new Date();
                  return (
                    <tr key={appt.id} style={{ opacity: isPast && appt.status !== 'scheduled' ? 0.6 : 1 }}>
                      <td>
                        <div>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>
                            {schedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </strong>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                            {schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="patient-name-cell">
                          <div className="patient-avatar">{appt.patientName.charAt(0)}</div>
                          <div>
                            <strong style={{ fontSize: 'var(--text-sm)' }}>{appt.patientName}</strong>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                              {appt.patientEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${appt.type}`}>
                          {appt.type === 'video' ? '🎥' : '🎤'} {appt.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          appt.status === 'scheduled' ? 'badge-scheduled' :
                          appt.status === 'completed' ? 'badge-active' :
                          'badge-blocked'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                        {appt.createdAt}
                      </td>
                      <td>
                        {appt.status === 'scheduled' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(appt.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
