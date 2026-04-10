import { useState, useEffect } from 'react';
import { mockApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    mockApi.getPatients().then(p => {
      setPatients(p);
      setLoading(false);
    });
  }, []);

  const handleBlock = (email) => {
    mockApi.blockPatient(email).then(() => {
      setPatients(prev => prev.map(p =>
        p.email === email ? { ...p, status: 'blocked' } : p
      ));
    });
  };

  const handleUnblock = (email) => {
    mockApi.unblockPatient(email).then(() => {
      setPatients(prev => prev.map(p =>
        p.email === email ? { ...p, status: 'active' } : p
      ));
    });
  };

  if (loading) return <LoadingSpinner text="Loading patients..." />;

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container page-wrapper animate-fade-in">
      <div className="dashboard-header">
        <h1>Patient <span className="text-gradient">Management</span></h1>
        <p>Manage all enrolled patients, view their status, and take actions.</p>
      </div>

      {/* Filters */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div className="flex gap-2">
          {['all', 'active', 'blocked'].map(f => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ margin: 0 }}
            >
              {f === 'all' ? '👥 All' : f === 'active' ? '✅ Active' : '🚫 Blocked'}
              {' '}({f === 'all'
                ? patients.length
                : patients.filter(p => p.status === f).length})
            </button>
          ))}
        </div>
        <input
          className="form-input"
          placeholder="🔍 Search patients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
          id="patient-search"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No patients found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="data-table-wrapper animate-fade-in-up">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrolled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-name-cell">
                      <div className="patient-avatar">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{patient.name}</strong>
                        {patient.notes && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                            {patient.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {patient.email}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {patient.phone}
                  </td>
                  <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    {new Date(patient.enrollDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge badge-${patient.status}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    {patient.status === 'active' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleBlock(patient.email)}
                        id={`block-${patient.id}`}
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUnblock(patient.email)}
                        id={`unblock-${patient.id}`}
                      >
                        Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
